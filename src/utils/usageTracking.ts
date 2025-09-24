// Usage Tracking Service
// This service tracks API usage and integrates with wallet balance management

import { supabase } from '../lib/supabase'
import { getProviderConfig } from './providerConfig'
import { fetchWalletBalance } from './walletBalanceApis'
import toast from 'react-hot-toast'

export interface UsageEvent {
  apiKeyId: string
  provider: string
  model?: string
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  characters?: number
  images?: number
  audioSeconds?: number
  requests?: number
  costUSD?: number
  metadata?: Record<string, any>
}

export interface UsageCalculationResult {
  amount: number
  unit: string
  costUSD: number
  breakdown?: {
    inputCost?: number
    outputCost?: number
    baseCost?: number
  }
}

// Calculate usage cost based on provider pricing
export function calculateUsageCost(
  provider: string,
  usage: UsageEvent
): UsageCalculationResult {
  const config = getProviderConfig(provider)
  
  let amount = 0
  let costUSD = 0
  let breakdown: UsageCalculationResult['breakdown'] = {}

  switch (config.usageMetric) {
    case 'tokens':
      if (usage.inputTokens && usage.outputTokens && config.inputPricing && config.outputPricing) {
        // Separate input/output pricing
        const inputCost = (usage.inputTokens / 1000000) * config.inputPricing
        const outputCost = (usage.outputTokens / 1000000) * config.outputPricing
        costUSD = inputCost + outputCost
        amount = (usage.inputTokens || 0) + (usage.outputTokens || 0)
        breakdown = { inputCost, outputCost }
      } else if (usage.totalTokens && config.costPerUnit) {
        // Total tokens pricing
        amount = usage.totalTokens
        costUSD = (amount / 1000000) * (config.inputPricing || config.costPerUnit * 1000000)
      }
      break

    case 'characters':
      if (usage.characters && config.costPerUnit) {
        amount = usage.characters
        costUSD = (amount / 1000000) * (config.costPerUnit * 1000000)
      }
      break

    case 'images':
      if (usage.images && (config.imagePricing || config.costPerUnit)) {
        amount = usage.images
        costUSD = amount * (config.imagePricing || config.costPerUnit || 0)
      }
      break

    case 'audio_seconds':
      if (usage.audioSeconds && config.costPerUnit) {
        amount = usage.audioSeconds
        costUSD = (amount / 60) * (config.costPerUnit || 0) // Usually priced per minute
      }
      break

    case 'requests':
      if (usage.requests && config.costPerUnit) {
        amount = usage.requests
        costUSD = amount * (config.costPerUnit || 0)
      }
      break

    default:
      // Fallback to provided cost or zero
      costUSD = usage.costUSD || 0
      amount = usage.totalTokens || usage.characters || usage.images || usage.audioSeconds || usage.requests || 1
  }

  return {
    amount,
    unit: config.usageMetric,
    costUSD: Math.max(0, costUSD), // Ensure non-negative
    breakdown
  }
}

// Record usage transaction in database
export async function recordUsageTransaction(
  userId: string,
  apiKeyId: string,
  usage: UsageEvent
): Promise<void> {
  try {
    const calculation = calculateUsageCost(usage.provider, usage)
    
    const transactionData = {
      user_id: userId,
      api_key_id: apiKeyId,
      provider: usage.provider,
      transaction_type: 'usage' as const,
      amount: calculation.amount,
      unit: calculation.unit,
      cost_usd: calculation.costUSD,
      model_used: usage.model || null,
      metadata: {
        ...usage.metadata,
        breakdown: calculation.breakdown,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        characters: usage.characters,
        images: usage.images,
        audioSeconds: usage.audioSeconds,
        requests: usage.requests
      }
    }

    const { error } = await supabase
      .from('usage_transactions')
      .insert([transactionData])

    if (error) throw error

    // Update API key usage counters
    await updateApiKeyUsage(apiKeyId, calculation.amount)

    console.log(`Usage recorded: ${calculation.amount} ${calculation.unit} for $${calculation.costUSD.toFixed(6)}`)
  } catch (error) {
    console.error('Failed to record usage transaction:', error)
    throw error
  }
}

// Update API key current usage
async function updateApiKeyUsage(apiKeyId: string, usageAmount: number): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_api_key_usage', {
      key_id: apiKeyId,
      usage_amount: usageAmount
    })

    if (error) {
      // Fallback: manual update if RPC doesn't exist
      const { data: currentKey } = await supabase
        .from('api_keys')
        .select('current_usage')
        .eq('id', apiKeyId)
        .single()

      if (currentKey) {
        const newUsage = (currentKey.current_usage || 0) + usageAmount
        await supabase
          .from('api_keys')
          .update({ 
            current_usage: newUsage,
            last_used: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', apiKeyId)
      }
    }
  } catch (error) {
    console.error('Failed to update API key usage:', error)
    throw error
  }
}

// Check if usage would exceed wallet balance
export async function checkWalletBalance(
  apiKeyId: string,
  provider: string,
  plannedUsage: UsageEvent
): Promise<{ canAfford: boolean; currentBalance: number; estimatedCost: number }> {
  try {
    const config = getProviderConfig(provider)
    
    // Only check balance for providers that support it
    if (!config.hasWalletBalance) {
      return { canAfford: true, currentBalance: Infinity, estimatedCost: 0 }
    }

    // Get current wallet balance from database or API
    // This is a simplified version - in production you'd want to sync with actual provider balance
    const { data: recentTransactions } = await supabase
      .from('usage_transactions')
      .select('transaction_type, cost_usd')
      .eq('api_key_id', apiKeyId)
      .order('timestamp', { ascending: false })
      .limit(100)

    let balance = 0
    if (recentTransactions) {
      const credits = recentTransactions
        .filter(t => ['purchase', 'credit', 'refund'].includes(t.transaction_type))
        .reduce((sum, t) => sum + (t.cost_usd || 0), 0)
      
      const debits = recentTransactions
        .filter(t => t.transaction_type === 'usage')
        .reduce((sum, t) => sum + (t.cost_usd || 0), 0)
      
      balance = Math.max(0, credits - debits)
    }

    const calculation = calculateUsageCost(provider, plannedUsage)
    const canAfford = balance >= calculation.costUSD

    return {
      canAfford,
      currentBalance: balance,
      estimatedCost: calculation.costUSD
    }
  } catch (error) {
    console.error('Failed to check wallet balance:', error)
    return { canAfford: false, currentBalance: 0, estimatedCost: 0 }
  }
}

// Usage monitoring service
export class UsageMonitor {
  private static instance: UsageMonitor | null = null
  private listeners: Map<string, (usage: UsageEvent) => void> = new Map()
  private rateLimits: Map<string, { requests: number; resetTime: number }> = new Map()

  static getInstance(): UsageMonitor {
    if (!UsageMonitor.instance) {
      UsageMonitor.instance = new UsageMonitor()
    }
    return UsageMonitor.instance
  }

  // Track API usage
  async trackUsage(
    userId: string,
    apiKeyId: string,
    usage: UsageEvent,
    options?: {
      checkBalance?: boolean
      showNotifications?: boolean
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check wallet balance if requested
      if (options?.checkBalance) {
        const balanceCheck = await checkWalletBalance(apiKeyId, usage.provider, usage)
        if (!balanceCheck.canAfford) {
          const error = `Insufficient wallet balance. Available: $${balanceCheck.currentBalance.toFixed(2)}, Required: $${balanceCheck.estimatedCost.toFixed(6)}`
          
          if (options.showNotifications) {
            toast.error(error)
          }
          
          return { success: false, error }
        }
      }

      // Record the usage
      await recordUsageTransaction(userId, apiKeyId, usage)

      // Notify listeners
      this.notifyListeners(apiKeyId, usage)

      // Show success notification if enabled
      if (options?.showNotifications) {
        const calculation = calculateUsageCost(usage.provider, usage)
        toast.success(
          `Usage tracked: ${calculation.amount} ${calculation.unit} ($${calculation.costUSD.toFixed(6)})`
        )
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to track usage'
      
      if (options?.showNotifications) {
        toast.error(`Usage tracking failed: ${errorMessage}`)
      }
      
      return { success: false, error: errorMessage }
    }
  }

  // Add usage listener
  addUsageListener(apiKeyId: string, callback: (usage: UsageEvent) => void): void {
    this.listeners.set(apiKeyId, callback)
  }

  // Remove usage listener
  removeUsageListener(apiKeyId: string): void {
    this.listeners.delete(apiKeyId)
  }

  // Notify listeners of usage events
  private notifyListeners(apiKeyId: string, usage: UsageEvent): void {
    const listener = this.listeners.get(apiKeyId)
    if (listener) {
      try {
        listener(usage)
      } catch (error) {
        console.error('Usage listener error:', error)
      }
    }
  }

  // Check rate limits
  checkRateLimit(apiKeyId: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const rateLimitData = this.rateLimits.get(apiKeyId)

    if (!rateLimitData || now > rateLimitData.resetTime) {
      this.rateLimits.set(apiKeyId, {
        requests: 1,
        resetTime: now + windowMs
      })
      return true
    }

    if (rateLimitData.requests >= limit) {
      return false
    }

    rateLimitData.requests++
    return true
  }

  // Get usage statistics for an API key
  async getUsageStats(
    apiKeyId: string,
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<{
    totalCost: number
    totalUsage: number
    usageUnit: string
    transactionCount: number
    averageCost: number
  }> {
    try {
      const hours = {
        '1h': 1,
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30
      }[timeRange]

      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

      const { data: transactions, error } = await supabase
        .from('usage_transactions')
        .select('amount, unit, cost_usd')
        .eq('api_key_id', apiKeyId)
        .eq('transaction_type', 'usage')
        .gte('timestamp', since)

      if (error) throw error

      if (!transactions || transactions.length === 0) {
        return {
          totalCost: 0,
          totalUsage: 0,
          usageUnit: 'tokens',
          transactionCount: 0,
          averageCost: 0
        }
      }

      const totalCost = transactions.reduce((sum, t) => sum + (t.cost_usd || 0), 0)
      const totalUsage = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
      const transactionCount = transactions.length
      const averageCost = transactionCount > 0 ? totalCost / transactionCount : 0
      const usageUnit = transactions[0]?.unit || 'tokens'

      return {
        totalCost,
        totalUsage,
        usageUnit,
        transactionCount,
        averageCost
      }
    } catch (error) {
      console.error('Failed to get usage stats:', error)
      return {
        totalCost: 0,
        totalUsage: 0,
        usageUnit: 'tokens',
        transactionCount: 0,
        averageCost: 0
      }
    }
  }
}

// Convenience function to get the usage monitor instance
export const usageMonitor = UsageMonitor.getInstance()

// Helper functions for common usage patterns
export const trackTokenUsage = async (
  userId: string,
  apiKeyId: string,
  provider: string,
  inputTokens: number,
  outputTokens: number,
  model?: string
) => {
  return usageMonitor.trackUsage(userId, apiKeyId, {
    apiKeyId,
    provider,
    model,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens
  }, { checkBalance: true, showNotifications: false })
}

export const trackImageGeneration = async (
  userId: string,
  apiKeyId: string,
  provider: string,
  imageCount: number,
  model?: string
) => {
  return usageMonitor.trackUsage(userId, apiKeyId, {
    apiKeyId,
    provider,
    model,
    images: imageCount
  }, { checkBalance: true, showNotifications: false })
}

export const trackAudioProcessing = async (
  userId: string,
  apiKeyId: string,
  provider: string,
  durationSeconds: number,
  model?: string
) => {
  return usageMonitor.trackUsage(userId, apiKeyId, {
    apiKeyId,
    provider,
    model,
    audioSeconds: durationSeconds
  }, { checkBalance: true, showNotifications: false })
}

// Database function to create the increment function (run this once)
export const createIncrementFunction = async () => {
  const { error } = await supabase.rpc('create_increment_function', {})
  if (error) {
    console.warn('Failed to create increment function:', error)
  }
}
