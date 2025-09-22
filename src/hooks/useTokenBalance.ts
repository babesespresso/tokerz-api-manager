import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useTheme } from './useTheme'
import toast from 'react-hot-toast'

interface TokenBalance {
  _id: string
  user_id: string
  provider: string
  balance: number
  total_purchased: number
  total_used: number
  last_updated: string
}

export function useTokenBalance() {
  const { user, isAuthenticated } = useAuth()
  const { theme } = useTheme()
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBalances = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    try {
      // TODO: Replace with Supabase token balances fetch
      setBalances([])
    } catch (error) {
      console.error('Failed to fetch token balances:', error)
      toast.error('Failed to load token balances')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const purchaseTokens = async (provider: string, amount: number, cost: number) => {
    if (!user) return

    try {
      // TODO: Replace with Supabase token purchase
      const newBalance: TokenBalance = {
        _id: Date.now().toString(),
        user_id: user.id,
        provider,
        balance: amount,
        total_purchased: amount,
        total_used: 0,
        last_updated: new Date().toISOString()
      }

      setBalances(prev => {
        const existing = prev.find(b => b.provider === provider)
        if (existing) {
          return prev.map(b => 
            b.provider === provider 
              ? { ...b, balance: b.balance + amount, total_purchased: b.total_purchased + amount }
              : b
          )
        }
        return [...prev, newBalance]
      })

      toast.success(`Successfully purchased ${amount.toLocaleString()} tokens for ${provider}`)
    } catch (error) {
      console.error('Failed to purchase tokens:', error)
      toast.error('Failed to purchase tokens')
    }
  }

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  return {
    balances,
    loading,
    fetchBalances,
    purchaseTokens
  }
}
