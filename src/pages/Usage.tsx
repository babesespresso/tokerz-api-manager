
import React, { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import {Activity, Calendar, DollarSign, TrendingUp, Filter, Download, RefreshCw} from 'lucide-react'
import { useApiKeys } from '../hooks/useApiKeys'
import { useUsageData } from '../hooks/useUsageData'
import { getProviderConfig, formatUsage, formatCurrency } from '../utils/providerConfig'

const Usage = () => {
  const { apiKeys, loading: keysLoading } = useApiKeys()
  const { usageData, loading: usageLoading } = useUsageData()
  const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, 90d
  const [selectedProvider, setSelectedProvider] = useState('all')

  const safeApiKeys = Array.isArray(apiKeys) ? apiKeys : []
  const safeUsageData = Array.isArray(usageData) ? usageData : []

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date()
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    return safeUsageData.filter(item => {
      if (!item?.timestamp) return false
      const itemDate = new Date(item.timestamp)
      const matchesTime = itemDate >= cutoff
      
      if (selectedProvider === 'all') return matchesTime
      
      const apiKey = safeApiKeys.find(key => key._id === item.api_key_id)
      return matchesTime && apiKey?.provider === selectedProvider
    })
  }, [safeUsageData, safeApiKeys, timeRange, selectedProvider])

  // Calculate totals
  const totalUsage = filteredData.reduce((sum, item) => sum + (item?.amount || 0), 0)
  const totalCost = filteredData.reduce((sum, item) => sum + (item?.cost_usd || 0), 0)
  const totalTransactions = filteredData.length

  // Usage by provider
  const providerUsage = useMemo(() => {
    const usage = {} as Record<string, { usage: number; cost: number; transactions: number }>
    
    filteredData.forEach(item => {
      const apiKey = safeApiKeys.find(key => key._id === item?.api_key_id)
      if (!apiKey?.provider) return
      
      const config = getProviderConfig(apiKey.provider)
      const providerName = config?.displayName || apiKey.provider
      
      if (!usage[providerName]) {
        usage[providerName] = { usage: 0, cost: 0, transactions: 0 }
      }
      
      usage[providerName].usage += item?.amount || 0
      usage[providerName].cost += item?.cost_usd || 0
      usage[providerName].transactions += 1
    })
    
    return Object.entries(usage).map(([name, data]) => ({
      name,
      ...data,
      color: getProviderConfig(name)?.color || '#6B7280'
    }))
  }, [filteredData, safeApiKeys])

  // Usage over time
  const usageOverTime = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const data = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      
      const dayData = filteredData.filter(item => {
        if (!item?.timestamp) return false
        const itemDate = new Date(item.timestamp)
        return itemDate.toDateString() === date.toDateString()
      })
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        usage: dayData.reduce((sum, item) => sum + (item?.amount || 0), 0),
        cost: dayData.reduce((sum, item) => sum + (item?.cost_usd || 0), 0),
        transactions: dayData.length
      })
    }
    
    return data
  }, [filteredData, timeRange])

  // Get unique providers for filter
  const providers = useMemo(() => {
    const uniqueProviders = new Set<string>()
    safeApiKeys.forEach(key => {
      if (key?.provider) {
        uniqueProviders.add(key.provider)
      }
    })
    return Array.from(uniqueProviders)
  }, [safeApiKeys])

  const exportData = () => {
    const csvData = filteredData.map(item => {
      const apiKey = safeApiKeys.find(key => key._id === item?.api_key_id)
      const config = getProviderConfig(apiKey?.provider || '')
      
      return {
        Date: item?.timestamp ? new Date(item.timestamp).toLocaleDateString() : '',
        Provider: config?.displayName || apiKey?.provider || '',
        'API Key': apiKey?.key_name || '',
        Usage: item?.amount || 0,
        Cost: item?.cost_usd || 0,
        Type: item?.transaction_type || ''
      }
    })
    
    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `usage-data-${timeRange}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (keysLoading || usageLoading) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-8 h-8 animate-spin text-white" />
          <span className="text-xl text-white">Loading usage data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-black overflow-auto min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Usage & Analytics
              </h1>
              <p className="text-base text-gray-300">
                Track your API usage, costs, and performance metrics
              </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button
                onClick={exportData}
                className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white"
            >
              <option value="all">All Providers</option>
              {providers.map(provider => {
                const config = getProviderConfig(provider)
                return (
                  <option key={provider} value={provider}>
                    {config?.displayName || provider}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Usage</p>
                <p className="text-2xl font-bold text-white">{formatUsage(totalUsage, 'tokens')}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-800">
                <Activity className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-400">
                {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Cost</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalCost)}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-800">
                <DollarSign className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-400">
                {totalTransactions} transactions
              </span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg Cost per 1K</p>
                <p className="text-2xl font-bold text-white">
                  {totalUsage > 0 ? formatCurrency((totalCost / totalUsage) * 1000) : '$0.00'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-800">
                <TrendingUp className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-400">
                Per 1,000 tokens
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Usage Over Time */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Usage Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#6B7280" 
                  strokeWidth={2}
                  dot={{ fill: '#6B7280' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Over Time */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="cost" fill="#6B7280" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provider Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Provider Distribution */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Usage by Provider</h3>
            {providerUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={providerUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="usage"
                  >
                    {providerUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No usage data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Provider Stats Table */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Provider Statistics</h3>
            {providerUsage.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {providerUsage.map((provider, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800 border border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: provider.color }}
                      />
                      <div>
                        <p className="font-medium text-white">{provider.name}</p>
                        <p className="text-sm text-gray-400">
                          {provider.transactions} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">
                        {formatUsage(provider.usage, 'tokens')}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatCurrency(provider.cost)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No provider data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Usage
