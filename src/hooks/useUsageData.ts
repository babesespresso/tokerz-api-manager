import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

interface UsageTransaction {
  _id: string
  user_id: string
  api_key_id: string
  provider: string
  transaction_type: 'usage' | 'purchase' | 'refund' | 'credit'
  amount: number
  unit: 'tokens' | 'requests' | 'characters' | 'images' | 'audio_seconds' | 'usd'
  cost_usd: number
  model_used?: string
  timestamp: string
  description?: string
}

interface UsageStats {
  totalTokens: number
  totalCost: number
  totalRequests: number
  providerBreakdown: Record<string, { tokens: number; cost: number; requests: number }>
}

export function useUsageData() {
  const { user, isAuthenticated } = useAuth()
  const [transactions, setTransactions] = useState<UsageTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<UsageStats>({
    totalTokens: 0,
    totalCost: 0,
    totalRequests: 0,
    providerBreakdown: {}
  })

  const fetchUsageData = useCallback(async (timeRange: string = '30d') => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    try {
      // TODO: Replace with Supabase usage transactions fetch
      // For now, return empty array
      setTransactions([])
      
      // Calculate stats from empty data
      setStats({
        totalTokens: 0,
        totalCost: 0,
        totalRequests: 0,
        providerBreakdown: {}
      })
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
      toast.error('Failed to load usage data')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const exportUsageData = useCallback(async (format: 'csv' | 'json' = 'csv') => {
    try {
      if (transactions.length === 0) {
        toast.error('No usage data to export')
        return
      }

      let content: string
      let filename: string
      let mimeType: string

      if (format === 'csv') {
        const headers = ['Date', 'Provider', 'Model', 'Amount', 'Unit', 'Cost (USD)', 'Type']
        const rows = transactions.map(t => [
          new Date(t.timestamp).toLocaleDateString(),
          t.provider,
          t.model_used || '',
          t.amount.toString(),
          t.unit,
          t.cost_usd.toFixed(4),
          t.transaction_type
        ])
        content = [headers, ...rows].map(row => row.join(',')).join('\n')
        filename = `usage-data-${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
      } else {
        content = JSON.stringify(transactions, null, 2)
        filename = `usage-data-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success(`Usage data exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Failed to export usage data:', error)
      toast.error('Failed to export usage data')
    }
  }, [transactions])

  useEffect(() => {
    fetchUsageData()
  }, [fetchUsageData])

  return {
    transactions,
    stats,
    loading,
    fetchUsageData,
    exportUsageData
  }
}
