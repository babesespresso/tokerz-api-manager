
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import {Key, Activity, DollarSign, TrendingUp, Zap, Users, Clock, AlertTriangle} from 'lucide-react'
import { useApiKeys } from '../hooks/useApiKeys'
import { useUsageData } from '../hooks/useUsageData'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../hooks/useAuth'
import { getProviderConfig, formatUsage, formatCurrency } from '../utils/providerConfig'

const Dashboard = () => {
  const { user } = useAuth()
  const { apiKeys, loading: keysLoading } = useApiKeys()
  const { usageData, loading: usageLoading } = useUsageData()
  const { subscription } = useSubscription()

  const safeApiKeys = Array.isArray(apiKeys) ? apiKeys : []
  const safeUsageData = Array.isArray(usageData) ? usageData : []

  // Calculate stats
  const totalKeys = safeApiKeys.length
  const activeKeys = safeApiKeys.filter(key => key?.status === 'active').length
  const totalUsage = safeUsageData.reduce((sum, item) => sum + (item?.amount || 0), 0)
  const totalCost = safeUsageData.reduce((sum, item) => sum + (item?.cost_usd || 0), 0)

  // Provider usage distribution
  const providerUsage = safeApiKeys.reduce((acc, key) => {
    if (!key?.provider) return acc
    const config = getProviderConfig(key.provider)
    const provider = config?.displayName || key.provider
    acc[provider] = (acc[provider] || 0) + (key.current_usage || 0)
    return acc
  }, {} as Record<string, number>)

  const providerData = Object.entries(providerUsage).map(([name, value]) => ({
    name,
    value,
    color: getProviderConfig(name)?.color || '#6B7280'
  }))

  // Usage over time (last 7 days)
  const usageOverTime = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayUsage = safeUsageData.filter(item => {
      if (!item?.timestamp) return false
      const itemDate = new Date(item.timestamp)
      return itemDate.toDateString() === date.toDateString()
    })
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      usage: dayUsage.reduce((sum, item) => sum + (item?.amount || 0), 0),
      cost: dayUsage.reduce((sum, item) => sum + (item?.cost_usd || 0), 0)
    }
  })

  // Recent activity
  const recentActivity = safeUsageData
    .sort((a, b) => new Date(b?.timestamp || 0).getTime() - new Date(a?.timestamp || 0).getTime())
    .slice(0, 5)

  if (keysLoading || usageLoading) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <span className="text-xl text-white">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-black overflow-auto min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Welcome back, {user?.displayName || user?.email || 'User'}!
          </h1>
          <p className="text-base text-gray-300">
            Here's an overview of your API usage and performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total API Keys</p>
                <p className="text-2xl font-bold text-white">{totalKeys}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-800">
                <Key className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-400">
                {activeKeys} active
              </span>
            </div>
          </div>

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
                This month
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
                Current month
              </span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Subscription</p>
                <p className="text-2xl font-bold text-white capitalize">
                  {subscription?.plan_type || 'Free'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-800">
                <Zap className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-400">
                {subscription?.status || 'Active'}
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
                  dot={{ fill: '#6B7280', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Provider Distribution */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Provider Usage</h3>
            {providerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={providerData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {providerData.map((entry, index) => (
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
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const apiKey = safeApiKeys.find(key => key._id === activity?.api_key_id)
                const config = getProviderConfig(apiKey?.provider || '')
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-700">
                        <Activity className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {config?.displayName || apiKey?.provider || 'Unknown Provider'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatUsage(activity?.amount || 0, 'tokens')} • {apiKey?.key_name || 'Unknown Key'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">
                        {formatCurrency(activity?.cost_usd || 0)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {activity?.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No recent activity</p>
              <p className="text-sm">Start using your API keys to see activity here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
