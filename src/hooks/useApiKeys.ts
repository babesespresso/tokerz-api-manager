
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { getProviderConfig } from '../utils/providerConfig'
import { detectApiKeyProvider, validateApiKeyFormat, getDetectionExplanation } from '../utils/providerDetection'
import { getApiKeys, createApiKey, supabase } from '../lib/supabase'
import { fetchWalletBalance, fetchMultipleWalletBalances, WalletBalanceResponse } from '../utils/walletBalanceApis'
import { Database } from '../lib/database.types'
import toast from 'react-hot-toast'

type DatabaseApiKey = Database['public']['Tables']['api_keys']['Row']
type DatabaseApiKeyInsert = Database['public']['Tables']['api_keys']['Insert']

interface ApiKey {
  _id: string
  user_id: string
  provider: string
  key_name: string
  encrypted_key: string
  key_preview: string
  status: 'active' | 'inactive' | 'expired' | 'suspended'
  usage_limit: number
  current_usage: number
  usage_metric: 'tokens' | 'requests' | 'characters' | 'images' | 'audio_seconds'
  last_used?: string
  created_at: string
  updated_at: string
  wallet_balance?: number
}

interface WalletBalanceInfo extends WalletBalanceResponse {
  isLoading: boolean
  lastChecked?: string
}

interface ApiKeyTransaction {
  _id: string
  api_key_id: string
  transaction_type: 'usage' | 'purchase' | 'refund' | 'credit'
  amount: number
  cost_usd: number
  timestamp: string
  description?: string
}

export function useApiKeys() {
  const { user, isAuthenticated } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(false)
  const [keyTransactions, setKeyTransactions] = useState<Record<string, ApiKeyTransaction[]>>({})
  const [walletBalances, setWalletBalances] = useState<Record<string, WalletBalanceInfo>>({})

  const fetchApiKeys = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    try {
      const keys = await getApiKeys(user.id)
      // Map database fields to our interface
      const mappedKeys = keys.map((key: DatabaseApiKey) => ({
        _id: key.id,
        user_id: key.user_id,
        provider: key.provider,
        key_name: key.key_name,
        encrypted_key: key.encrypted_key,
        key_preview: key.key_preview,
        status: key.status as ApiKey['status'],
        usage_limit: Number(key.usage_limit),
        current_usage: Number(key.current_usage),
        usage_metric: key.usage_metric as ApiKey['usage_metric'],
        last_used: key.last_used || undefined,
        created_at: key.created_at,
        updated_at: key.updated_at
      }))
      setApiKeys(mappedKeys)
      console.log('Loaded API keys from database:', mappedKeys.length)
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const fetchKeyTransactions = useCallback(async (apiKeyId: string) => {
    try {
      // TODO: Replace with Supabase transactions fetch
      setKeyTransactions(prev => ({
        ...prev,
        [apiKeyId]: []
      }))
    } catch (error) {
      console.error('Failed to fetch key transactions:', error)
    }
  }, [])

  const fetchWalletBalanceForKey = useCallback(async (apiKey: ApiKey) => {
    const config = getProviderConfig(apiKey.provider)
    
    if (!config.hasWalletBalance || !apiKey.encrypted_key) {
      return
    }

    // Set loading state
    setWalletBalances(prev => ({
      ...prev,
      [apiKey._id]: {
        ...prev[apiKey._id],
        isLoading: true,
        balance: prev[apiKey._id]?.balance || 0,
        currency: prev[apiKey._id]?.currency || 'USD'
      }
    }))

    try {
      const balanceResponse = await fetchWalletBalance(apiKey.provider, apiKey.encrypted_key)
      
      setWalletBalances(prev => ({
        ...prev,
        [apiKey._id]: {
          ...balanceResponse,
          isLoading: false,
          lastChecked: new Date().toISOString()
        }
      }))

      // Show success/error messages for balance checks
      if (balanceResponse.error) {
        console.warn(`Wallet balance error for ${apiKey.key_name}:`, balanceResponse.error)
        // Don't show toast for every error, only log it
      } else {
        console.log(`Wallet balance for ${apiKey.key_name}: ${balanceResponse.currency} ${balanceResponse.balance}`)
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error)
      setWalletBalances(prev => ({
        ...prev,
        [apiKey._id]: {
          balance: 0,
          currency: 'USD',
          isLoading: false,
          error: 'Failed to fetch balance',
          lastChecked: new Date().toISOString()
        }
      }))
    }
  }, [])

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (error) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        toast.success(`${label} copied to clipboard`)
      } catch (fallbackError) {
        toast.error('Failed to copy to clipboard')
      }
      document.body.removeChild(textArea)
    }
  }

  const addApiKey = async (keyData: {
    key_name: string
    api_key: string
    usage_limit?: number
    provider?: string // Optional manual override
  }) => {
    if (!user) return

    try {
      // Validate API key format first
      const validation = validateApiKeyFormat(keyData.api_key)
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid API key format')
        throw new Error(validation.error || 'Invalid API key format')
      }

      // Detect provider automatically
      const detectionResult = detectApiKeyProvider(keyData.api_key)
      
      // Use manual override if provided, otherwise use detected provider
      const finalProvider = keyData.provider || detectionResult.provider
      
      if (!finalProvider) {
        toast.error('Could not detect API key provider. Please check your key format.')
        throw new Error('Unable to detect provider from API key')
      }

      const providerConfig = getProviderConfig(finalProvider)
      
      // Show detection result to user
      if (detectionResult.confidence > 0.7) {
        const explanation = getDetectionExplanation(keyData.api_key, detectionResult)
        console.log('Provider detection:', explanation)
        toast.success(`🎯 ${explanation}`)
      } else if (detectionResult.confidence > 0) {
        toast(`⚠️ Low confidence detection: ${providerConfig.displayName}`, {
          duration: 4000,
          icon: '⚠️'
        })
      }
      
      // Store the actual API key - NO ENCRYPTION
      const actualKey = keyData.api_key
      const keyPreview = `${keyData.api_key.slice(0, 7)}...${keyData.api_key.slice(-6)}`

      // Save to Supabase database
      const dbKeyData: DatabaseApiKeyInsert = {
        user_id: user.id,
        provider: finalProvider,
        key_name: keyData.key_name,
        encrypted_key: actualKey,
        key_preview: keyPreview,
        status: 'active',
        usage_limit: keyData.usage_limit || getDefaultUsageLimit(finalProvider),
        current_usage: 0,
        usage_metric: providerConfig.usageMetric,
        provider_category: providerConfig.category,
        provider_company: providerConfig.company || null,
        context_length: providerConfig.contextLength || null,
        input_pricing: providerConfig.inputPricing || null,
        output_pricing: providerConfig.outputPricing || null,
        image_pricing: providerConfig.imagePricing || null
      }

      const savedKey = await createApiKey(dbKeyData) as DatabaseApiKey
      
      // Map back to our interface format
      const newKey: ApiKey = {
        _id: savedKey.id,
        user_id: savedKey.user_id,
        provider: savedKey.provider,
        key_name: savedKey.key_name,
        encrypted_key: savedKey.encrypted_key,
        key_preview: savedKey.key_preview,
        status: savedKey.status as ApiKey['status'],
        usage_limit: Number(savedKey.usage_limit),
        current_usage: Number(savedKey.current_usage),
        usage_metric: savedKey.usage_metric as ApiKey['usage_metric'],
        last_used: savedKey.last_used || undefined,
        created_at: savedKey.created_at,
        updated_at: savedKey.updated_at
      }

      setApiKeys(prev => [newKey, ...prev])
      
      // Check wallet balance immediately for supported providers
      if (providerConfig.hasWalletBalance) {
        fetchWalletBalanceForKey(newKey)
        toast.success(`✅ API key added successfully! Checking wallet balance...`)
      } else {
        toast.success('✅ API key added successfully and saved!')
      }
      
      console.log('API key saved to database:', newKey._id)
      return newKey
    } catch (error) {
      console.error('Failed to add API key:', error)
      toast.error('Failed to add API key to database')
      throw error
    }
  }

  const updateApiKey = async (keyId: string, updates: Partial<ApiKey>) => {
    try {
      // TODO: Replace with Supabase API key update
      setApiKeys(prev => prev.map(key => 
        key._id === keyId ? { ...key, ...updates, updated_at: new Date().toISOString() } : key
      ))
      toast.success('API key updated successfully')
    } catch (error) {
      console.error('Failed to update API key:', error)
      toast.error('Failed to update API key')
    }
  }

  const deleteApiKey = async (keyId: string) => {
    if (!keyId) {
      toast.error('Invalid API key ID')
      return
    }

    try {
      console.log(`🗑️ Deleting API key from database: ${keyId}`)
      
      // Delete from Supabase database
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)

      if (error) {
        console.error('Supabase delete error:', error)
        throw error
      }

      console.log(`✅ API key deleted from database: ${keyId}`)
      
      // Update local state
      setApiKeys(prev => prev.filter(key => key._id !== keyId))
      
      // Clean up related data
      setKeyTransactions(prev => {
        const newTransactions = { ...prev }
        delete newTransactions[keyId]
        return newTransactions
      })
      
      setWalletBalances(prev => {
        const newBalances = { ...prev }
        delete newBalances[keyId]
        return newBalances
      })
      
      toast.success('API key deleted successfully')
    } catch (error) {
      console.error('Failed to delete API key:', error)
      toast.error(`Failed to delete API key: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Refresh the list to sync with database
      fetchApiKeys()
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  useEffect(() => {
    apiKeys.forEach(key => {
      fetchKeyTransactions(key._id)
    })
  }, [apiKeys, fetchKeyTransactions])

  // Fetch wallet balances for all keys that support it
  const refreshAllWalletBalances = useCallback(async () => {
    const keysWithWalletSupport = apiKeys.filter((key: ApiKey) => {
      const config = getProviderConfig(key.provider)
      return config.hasWalletBalance && key.encrypted_key
    })

    if (keysWithWalletSupport.length === 0) return

    try {
      const apiKeyData = keysWithWalletSupport.map((key: ApiKey) => ({
        id: key._id,
        provider: key.provider,
        apiKey: key.encrypted_key
      }))

      const balanceResults = await fetchMultipleWalletBalances(apiKeyData)
      
      const updatedBalances: Record<string, WalletBalanceInfo> = {}
      
      Object.entries(balanceResults).forEach(([keyId, result]) => {
        updatedBalances[keyId] = {
          ...result,
          isLoading: false,
          lastChecked: new Date().toISOString()
        }
      })

      setWalletBalances(prev => ({
        ...prev,
        ...updatedBalances
      }))

      console.log(`Updated wallet balances for ${Object.keys(updatedBalances).length} keys`)
    } catch (error) {
      console.error('Failed to fetch multiple wallet balances:', error)
    }
  }, [apiKeys])

  // Auto-refresh balances on mount and when API keys change
  useEffect(() => {
    if (apiKeys.length > 0) {
      refreshAllWalletBalances()
    }
  }, [apiKeys, refreshAllWalletBalances])

  // Manual refresh function
  const refreshWalletBalance = useCallback(async (apiKey: ApiKey) => {
    await fetchWalletBalanceForKey(apiKey)
  }, [fetchWalletBalanceForKey])

  return {
    apiKeys,
    loading,
    keyTransactions,
    walletBalances,
    fetchApiKeys,
    fetchKeyTransactions,
    addApiKey,
    updateApiKey,
    deleteApiKey,
    copyToClipboard,
    refreshWalletBalance,
    refreshAllWalletBalances
  }
}

function getDefaultUsageLimit(provider: string): number {
  const config = getProviderConfig(provider)
  switch (config.usageMetric) {
    case 'tokens':
      return 100000
    case 'characters':
      return 500000
    case 'images':
      return 1000
    case 'audio_seconds':
      return 3600
    case 'requests':
      return 10000
    default:
      return 100000
  }
}
