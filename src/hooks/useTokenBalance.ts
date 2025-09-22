
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface TokenBalance {
  _id: string
  user_id: string
  provider: string
  balance: number
  total_purchased: number
  total_used: number
  created_at: string
  updated_at: string
}

export const useTokenBalance = () => {
  const { user, isAuthenticated } = useAuth()
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBalances = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    try {
      const { list } = await lumi.entities.token_balances.list({
        filter: { user_id: user.userId },
        sort: { created_at: -1 }
      })
      setBalances(list || [])
    } catch (error) {
      console.error('Failed to fetch token balances:', error)
      toast.error('Failed to load token balances')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const getBalanceByProvider = (provider: string): number => {
    const balance = balances.find(b => b.provider === provider)
    return balance?.balance || 0
  }

  const getTotalBalance = (): number => {
    return balances.reduce((total, balance) => total + balance.balance, 0)
  }

  const updateBalance = async (provider: string, tokenAmount: number, operation: 'add' | 'subtract') => {
    if (!isAuthenticated || !user) return

    try {
      // FIX 1: Handle 'all' provider by creating/updating universal balance
      const targetProvider = provider === 'all' ? 'universal' : provider
      const existingBalance = balances.find(b => b.provider === targetProvider)
      
      if (existingBalance) {
        const newBalance = operation === 'add' 
          ? existingBalance.balance + tokenAmount
          : Math.max(0, existingBalance.balance - tokenAmount)
        
        const newTotalUsed = operation === 'subtract' 
          ? existingBalance.total_used + tokenAmount
          : existingBalance.total_used
        
        const newTotalPurchased = operation === 'add'
          ? existingBalance.total_purchased + tokenAmount
          : existingBalance.total_purchased

        await lumi.entities.token_balances.update(existingBalance._id, {
          balance: newBalance,
          total_used: newTotalUsed,
          total_purchased: newTotalPurchased,
          updated_at: new Date().toISOString()
        })

        // Update local state immediately for better UX
        setBalances(prev => prev.map(b => 
          b._id === existingBalance._id 
            ? { ...b, balance: newBalance, total_used: newTotalUsed, total_purchased: newTotalPurchased }
            : b
        ))
      } else if (operation === 'add') {
        const newBalance = await lumi.entities.token_balances.create({
          user_id: user.userId,
          provider: targetProvider,
          balance: tokenAmount,
          total_purchased: tokenAmount,
          total_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

        // Add to local state immediately
        setBalances(prev => [...prev, newBalance])
      }
      
      // Refresh from server to ensure consistency
      await fetchBalances()
    } catch (error) {
      console.error('Failed to update balance:', error)
      throw error
    }
  }

  // FIX 2: Add method to deduct tokens for API key usage
  const deductTokensForApiKey = async (apiKeyId: string, tokensUsed: number) => {
    if (!isAuthenticated || !user) return false

    try {
      // Get the API key to find which provider and allocation
      const { list: apiKeys } = await lumi.entities.generated_api_keys.list({
        filter: { _id: apiKeyId, user_id: user.userId }
      })
      
      const apiKey = apiKeys?.[0]
      if (!apiKey) {
        throw new Error('API key not found')
      }

      // Check if API key has enough tokens
      const remainingTokens = apiKey.token_allocation - apiKey.tokens_used
      if (remainingTokens < tokensUsed) {
        throw new Error('Insufficient tokens allocated to this API key')
      }

      // Update API key usage
      await lumi.entities.generated_api_keys.update(apiKeyId, {
        tokens_used: apiKey.tokens_used + tokensUsed,
        last_used_at: new Date().toISOString()
      })

      // Create usage transaction record
      await lumi.entities.usage_transactions.create({
        user_id: user.userId,
        api_key_id: apiKeyId,
        provider: apiKey.provider,
        tokens_used: tokensUsed,
        cost_per_token: 0.001, // Default cost
        total_cost: tokensUsed * 0.001,
        request_type: 'api_call',
        status: 'completed',
        created_at: new Date().toISOString()
      })

      return true
    } catch (error) {
      console.error('Failed to deduct tokens:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  return {
    balances,
    loading,
    fetchBalances,
    getBalanceByProvider,
    getTotalBalance,
    updateBalance,
    deductTokensForApiKey
  }
}
