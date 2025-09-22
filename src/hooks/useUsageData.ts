
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import { useAuth } from './useAuth'

interface UsageTransaction {
  _id: string
  user_id: string
  api_key_id: string
  provider: string
  transaction_type: 'usage' | 'purchase' | 'refund' | 'credit'
  amount: number
  unit: 'tokens' | 'requests' | 'usd'
  cost_usd: number
  model_used?: string
  timestamp: string
}

interface UsageStats {
  totalCost: number
  totalTokens: number
  totalRequests: number
  providerBreakdown: Record<string, { cost: number; usage: number }>
  dailyUsage: Array<{ date: string; cost: number; usage: number }>
}

export function useUsageData() {
  const { user, isAuthenticated } = useAuth()
  const [transactions, setTransactions] = useState<UsageTransaction[]>([])
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchUsageData = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    try {
      const { list } = await lumi.entities.usage_transactions.list({
        filter: { user_id: user.userId },
        sort: { timestamp: -1 }
      })

      const usageTransactions = list || []
      setTransactions(usageTransactions)

      // Calculate stats
      const totalCost = usageTransactions.reduce((sum, t) => sum + (t.cost_usd || 0), 0)
      const totalTokens = usageTransactions
        .filter(t => t.unit === 'tokens')
        .reduce((sum, t) => sum + t.amount, 0)
      const totalRequests = usageTransactions
        .filter(t => t.unit === 'requests')
        .reduce((sum, t) => sum + t.amount, 0)

      // Provider breakdown
      const providerBreakdown: Record<string, { cost: number; usage: number }> = {}
      usageTransactions.forEach(t => {
        if (!providerBreakdown[t.provider]) {
          providerBreakdown[t.provider] = { cost: 0, usage: 0 }
        }
        providerBreakdown[t.provider].cost += t.cost_usd || 0
        providerBreakdown[t.provider].usage += t.amount
      })

      // Daily usage (last 30 days)
      const dailyUsage: Array<{ date: string; cost: number; usage: number }> = []
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date.toISOString().split('T')[0]
      }).reverse()

      last30Days.forEach(date => {
        const dayTransactions = usageTransactions.filter(t => 
          t.timestamp.startsWith(date)
        )
        const dayCost = dayTransactions.reduce((sum, t) => sum + (t.cost_usd || 0), 0)
        const dayUsage = dayTransactions.reduce((sum, t) => sum + t.amount, 0)
        
        dailyUsage.push({ date, cost: dayCost, usage: dayUsage })
      })

      setStats({
        totalCost,
        totalTokens,
        totalRequests,
        providerBreakdown,
        dailyUsage
      })
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    fetchUsageData()
  }, [fetchUsageData])

  return {
    transactions,
    stats,
    loading,
    fetchUsageData
  }
}
