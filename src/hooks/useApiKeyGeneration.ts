
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface GeneratedApiKey {
  _id: string
  user_id: string
  api_key: string
  provider: string
  token_allocation: number
  tokens_used: number
  status: string
  expires_at: string
  created_at: string
  last_used_at?: string
  // Enhanced proxy features
  proxy_type: 'universal' | 'provider_specific'
  rate_limit_per_minute: number
  allowed_models: string[]
  cost_multiplier: number // Your markup on provider costs
  upstream_provider_key_id?: string // Links to your master provider keys
}

interface ProxyApiResponse {
  success: boolean
  response?: string
  tokensUsed?: number
  cost?: number
  provider?: string
  model?: string
  error?: string
  requestId: string
}

export const useApiKeyGeneration = () => {
  const { user, isAuthenticated } = useAuth()
  const [apiKeys, setApiKeys] = useState<GeneratedApiKey[]>([])
  const [loading, setLoading] = useState(false)

  const fetchApiKeys = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    try {
      const { list } = await lumi.entities.generated_api_keys.list({
        filter: { user_id: user.userId },
        sort: { created_at: -1 }
      })
      setApiKeys(list || [])
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  // Enhanced proxy key generation with real business value
  const generateApiKey = async (
    provider: string, 
    tokenAllocation: number,
    options: {
      proxyType?: 'universal' | 'provider_specific'
      rateLimitPerMinute?: number
      allowedModels?: string[]
      costMultiplier?: number
    } = {}
  ) => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated')
    }

    try {
      // Generate a professional proxy API key
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const keyType = options.proxyType === 'universal' ? 'univ' : provider.substring(0, 4)
      const apiKey = `tkz_live_${keyType}_${timestamp}_${randomString}`

      // Set expiration (configurable, default 90 days)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 90)

      // Default configurations for different providers
      const providerDefaults = {
        openai: {
          allowedModels: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
          rateLimitPerMinute: 60,
          costMultiplier: 1.2 // 20% markup
        },
        claude: {
          allowedModels: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
          rateLimitPerMinute: 60,
          costMultiplier: 1.25 // 25% markup
        },
        gemini: {
          allowedModels: ['gemini-1.5-flash', 'gemini-1.5-pro'],
          rateLimitPerMinute: 100,
          costMultiplier: 1.15 // 15% markup
        },
        universal: {
          allowedModels: ['*'], // All models across providers
          rateLimitPerMinute: 120,
          costMultiplier: 1.3 // 30% markup for universal access
        }
      }

      const defaults = providerDefaults[provider as keyof typeof providerDefaults] || providerDefaults.universal

      const newApiKey = await lumi.entities.generated_api_keys.create({
        user_id: user.userId,
        api_key: apiKey,
        provider,
        token_allocation: tokenAllocation,
        tokens_used: 0,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
        // Enhanced proxy features
        proxy_type: options.proxyType || (provider === 'universal' ? 'universal' : 'provider_specific'),
        rate_limit_per_minute: options.rateLimitPerMinute || defaults.rateLimitPerMinute,
        allowed_models: options.allowedModels || defaults.allowedModels,
        cost_multiplier: options.costMultiplier || defaults.costMultiplier
      })

      setApiKeys(prev => [newApiKey, ...prev])
      toast.success(`Proxy API key generated! Routes to real ${provider.toUpperCase()} services`)
      return newApiKey
    } catch (error) {
      console.error('Failed to generate proxy API key:', error)
      toast.error('Failed to generate proxy API key')
      throw error
    }
  }

  // Real proxy API call that routes to actual providers
  const executeProxyApiCall = async (
    apiKey: string, 
    prompt: string, 
    options: {
      model?: string
      maxTokens?: number
      temperature?: number
      provider?: string // For universal keys
    } = {}
  ): Promise<ProxyApiResponse> => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    try {
      // Find and validate the proxy key
      const keyData = apiKeys.find(k => k.api_key === apiKey && k.status === 'active')
      
      if (!keyData) {
        throw new Error('Invalid or inactive proxy API key')
      }

      // Check expiration
      if (new Date() > new Date(keyData.expires_at)) {
        throw new Error('Proxy API key has expired')
      }

      // Rate limiting check (simplified - in production use Redis)
      const rateLimitKey = `rate_limit_${keyData._id}`
      // Implementation would check recent requests count

      // Determine target provider and model
      const targetProvider = options.provider || keyData.provider
      const targetModel = options.model || getDefaultModel(targetProvider)

      // Validate model is allowed
      if (keyData.allowed_models.length > 0 && 
          !keyData.allowed_models.includes('*') && 
          !keyData.allowed_models.includes(targetModel)) {
        throw new Error(`Model ${targetModel} not allowed for this API key`)
      }

      // Get upstream provider credentials (your master keys)
      const upstreamKey = await getUpstreamProviderKey(targetProvider)
      if (!upstreamKey) {
        throw new Error(`No upstream provider key available for ${targetProvider}`)
      }

      // Make the actual API call to the provider
      const providerResponse = await makeUpstreamApiCall(upstreamKey, targetProvider, {
        prompt,
        model: targetModel,
        maxTokens: options.maxTokens || 150,
        temperature: options.temperature || 0.7
      })

      // Calculate costs and usage
      const tokensUsed = providerResponse.tokensUsed
      const providerCost = providerResponse.cost || (tokensUsed * getProviderCostPerToken(targetProvider))
      const customerCost = providerCost * keyData.cost_multiplier

      // Check token allocation
      const remainingTokens = keyData.token_allocation - keyData.tokens_used
      if (remainingTokens < tokensUsed) {
        throw new Error('Insufficient tokens allocated to this proxy API key')
      }

      // Update usage tracking
      await lumi.entities.generated_api_keys.update(keyData._id, {
        tokens_used: keyData.tokens_used + tokensUsed,
        last_used_at: new Date().toISOString()
      })

      // Create detailed usage transaction
      await lumi.entities.usage_transactions.create({
        user_id: keyData.user_id,
        api_key_id: keyData._id,
        provider: targetProvider,
        tokens_used: tokensUsed,
        cost_per_token: customerCost / tokensUsed,
        total_cost: customerCost,
        request_type: 'proxy_completion',
        status: 'completed',
        created_at: new Date().toISOString(),
        metadata: {
          request_id: requestId,
          model: targetModel,
          prompt_length: prompt.length,
          upstream_provider: targetProvider,
          provider_cost: providerCost,
          markup_applied: keyData.cost_multiplier,
          rate_limit_remaining: keyData.rate_limit_per_minute // Would be calculated
        }
      })

      // Update local state
      setApiKeys(prev => prev.map(key => 
        key._id === keyData._id 
          ? { ...key, tokens_used: key.tokens_used + tokensUsed, last_used_at: new Date().toISOString() }
          : key
      ))

      return {
        success: true,
        response: providerResponse.response,
        tokensUsed,
        cost: customerCost,
        provider: targetProvider,
        model: targetModel,
        requestId
      }

    } catch (error) {
      console.error('Proxy API call failed:', error)
      
      // Log failed request for monitoring
      await lumi.entities.usage_transactions.create({
        user_id: user?.userId || 'unknown',
        api_key_id: apiKeys.find(k => k.api_key === apiKey)?._id || 'unknown',
        provider: options.provider || 'unknown',
        tokens_used: 0,
        cost_per_token: 0,
        total_cost: 0,
        request_type: 'proxy_completion',
        status: 'failed',
        created_at: new Date().toISOString(),
        metadata: {
          request_id: requestId,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          prompt_length: prompt.length
        }
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Proxy API call failed',
        requestId
      }
    }
  }

  // Helper function to make actual upstream API calls
  const makeUpstreamApiCall = async (
    upstreamKey: string,
    provider: string,
    options: {
      prompt: string
      model: string
      maxTokens: number
      temperature: number
    }
  ) => {
    const endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      claude: 'https://api.anthropic.com/v1/messages',
      anthropic: 'https://api.anthropic.com/v1/messages',
      gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      google: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    let body: any = {}
    let url = endpoints[provider.toLowerCase() as keyof typeof endpoints]

    // Configure request based on provider
    switch (provider.toLowerCase()) {
      case 'openai':
        headers['Authorization'] = `Bearer ${upstreamKey}`
        body = {
          model: options.model,
          messages: [{ role: 'user', content: options.prompt }],
          max_tokens: options.maxTokens,
          temperature: options.temperature
        }
        break

      case 'claude':
      case 'anthropic':
        headers['x-api-key'] = upstreamKey
        headers['anthropic-version'] = '2023-06-01'
        body = {
          model: options.model,
          max_tokens: options.maxTokens,
          messages: [{ role: 'user', content: options.prompt }]
        }
        break

      case 'gemini':
      case 'google':
        url = `${url}?key=${upstreamKey}`
        body = {
          contents: [{ parts: [{ text: options.prompt }] }],
          generationConfig: {
            maxOutputTokens: options.maxTokens,
            temperature: options.temperature
          }
        }
        break

      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(errorData.error?.message || `Provider API error: ${response.status}`)
    }

    const data = await response.json()

    // Parse response based on provider
    let responseText = ''
    let tokensUsed = 0

    switch (provider.toLowerCase()) {
      case 'openai':
        responseText = data.choices?.[0]?.message?.content || 'No response'
        tokensUsed = data.usage?.total_tokens || 0
        break

      case 'claude':
      case 'anthropic':
        responseText = data.content?.[0]?.text || 'No response'
        tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        break

      case 'gemini':
      case 'google':
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
        tokensUsed = data.usageMetadata?.totalTokenCount || 0
        break
    }

    return {
      response: responseText,
      tokensUsed,
      cost: tokensUsed * getProviderCostPerToken(provider)
    }
  }

  // Helper functions
  const getUpstreamProviderKey = async (provider: string): Promise<string | null> => {
    // In production, this would fetch your master provider keys from secure storage
    // For now, we'll check if admin has configured upstream keys
    try {
      const { list } = await lumi.entities.api_keys.list({
        filter: { 
          provider: provider,
          key_type: 'upstream_master',
          status: 'active'
        }
      })
      return list[0]?.encrypted_key || null
    } catch {
      return null
    }
  }

  const getDefaultModel = (provider: string): string => {
    const defaults = {
      openai: 'gpt-3.5-turbo',
      claude: 'claude-3-haiku-20240307',
      anthropic: 'claude-3-haiku-20240307',
      gemini: 'gemini-1.5-flash',
      google: 'gemini-1.5-flash'
    }
    return defaults[provider.toLowerCase() as keyof typeof defaults] || 'gpt-3.5-turbo'
  }

  const getProviderCostPerToken = (provider: string): number => {
    // Real provider costs per 1K tokens (approximate)
    const costs = {
      openai: 0.0015, // GPT-3.5-turbo
      claude: 0.00025, // Claude 3 Haiku
      anthropic: 0.00025,
      gemini: 0.000125, // Gemini 1.5 Flash
      google: 0.000125
    }
    return (costs[provider.toLowerCase() as keyof typeof costs] || 0.0015) / 1000
  }

  const revokeApiKey = async (keyId: string) => {
    try {
      await lumi.entities.generated_api_keys.update(keyId, {
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      
      setApiKeys(prev => prev.map(key => 
        key._id === keyId ? { ...key, status: 'suspended' } : key
      ))
      
      toast.success('Proxy API key revoked successfully')
    } catch (error) {
      console.error('Failed to revoke API key:', error)
      toast.error('Failed to revoke API key')
      throw error
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      await lumi.entities.generated_api_keys.delete(keyId)
      setApiKeys(prev => prev.filter(key => key._id !== keyId))
      toast.success('Proxy API key deleted successfully')
    } catch (error) {
      console.error('Failed to delete API key:', error)
      toast.error('Failed to delete API key')
      throw error
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  return {
    apiKeys,
    loading,
    fetchApiKeys,
    generateApiKey,
    revokeApiKey,
    deleteApiKey,
    executeProxyApiCall, // New enhanced proxy function
    simulateApiCall: executeProxyApiCall // Backward compatibility
  }
}
