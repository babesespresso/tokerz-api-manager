
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import { useAuth } from './useAuth'
import { getProviderConfig } from '../utils/providerConfig'
import toast from 'react-hot-toast'

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
  const [walletBalances, setWalletBalances] = useState<Record<string, number>>({})

  const fetchApiKeys = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    try {
      const { list } = await lumi.entities.api_keys.list({
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

  const fetchKeyTransactions = useCallback(async (apiKeyId: string) => {
    try {
      const { list } = await lumi.entities.usage_transactions.list({
        filter: { api_key_id: apiKeyId },
        sort: { timestamp: -1 },
        limit: 100
      })
      
      setKeyTransactions(prev => ({
        ...prev,
        [apiKeyId]: list || []
      }))
    } catch (error) {
      console.error('Failed to fetch key transactions:', error)
    }
  }, [])

  const fetchWalletBalance = useCallback(async (apiKey: ApiKey) => {
    const config = getProviderConfig(apiKey.provider)
    
    if (config.hasWalletBalance) {
      try {
        const transactions = keyTransactions[apiKey._id] || []
        
        if (transactions.length === 0) {
          setWalletBalances(prev => ({
            ...prev,
            [apiKey._id]: 0
          }))
          return
        }

        const totalCredits = transactions
          .filter(t => t.transaction_type === 'purchase' || t.transaction_type === 'credit' || t.transaction_type === 'refund')
          .reduce((sum, t) => sum + t.cost_usd, 0)
        
        const totalSpent = transactions
          .filter(t => t.transaction_type === 'usage')
          .reduce((sum, t) => sum + t.cost_usd, 0)
        
        const currentBalance = Math.max(0, totalCredits - totalSpent)
        
        setWalletBalances(prev => ({
          ...prev,
          [apiKey._id]: currentBalance
        }))
      } catch (error) {
        console.error('Failed to calculate wallet balance:', error)
        setWalletBalances(prev => ({
          ...prev,
          [apiKey._id]: 0
        }))
      }
    }
  }, [keyTransactions])

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
    provider: string
    key_name: string
    api_key: string
    usage_limit?: number
  }) => {
    if (!user) return

    try {
      const providerConfig = getProviderConfig(keyData.provider)
      
      // Store the actual API key - NO ENCRYPTION
      const actualKey = keyData.api_key
      const keyPreview = `${keyData.api_key.slice(0, 7)}...${keyData.api_key.slice(-6)}`

      const newKey = await lumi.entities.api_keys.create({
        user_id: user.userId,
        provider: keyData.provider,
        key_name: keyData.key_name,
        encrypted_key: actualKey, // Store actual key for copying
        key_preview: keyPreview,
        status: 'active',
        usage_limit: keyData.usage_limit || getDefaultUsageLimit(keyData.provider),
        current_usage: 0,
        usage_metric: providerConfig.usageMetric,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      setApiKeys(prev => [newKey, ...prev])
      toast.success('API key added successfully')
      return newKey
    } catch (error) {
      console.error('Failed to add API key:', error)
      toast.error('Failed to add API key')
      throw error
    }
  }

  const updateApiKey = async (keyId: string, updates: Partial<ApiKey>) => {
    try {
      const updatedKey = await lumi.entities.api_keys.update(keyId, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      setApiKeys(prev => prev.map(key => 
        key._id === keyId ? updatedKey : key
      ))
      toast.success('API key updated successfully')
    } catch (error) {
      console.error('Failed to update API key:', error)
      toast.error('Failed to update API key')
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      await lumi.entities.api_keys.delete(keyId)
      setApiKeys(prev => prev.filter(key => key._id !== keyId))
      
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
      toast.error('Failed to delete API key')
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

  useEffect(() => {
    apiKeys.forEach(key => {
      fetchWalletBalance(key)
    })
  }, [apiKeys, keyTransactions, fetchWalletBalance])

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
    copyToClipboard
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
