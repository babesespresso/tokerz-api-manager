
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import {Users, DollarSign, Key, CreditCard, Plus, Edit, Trash2, Search, Filter, BarChart3, Activity, AlertCircle, CheckCircle, Calendar, TrendingUp, Settings, Shield} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

interface AdminStats {
  totalUsers: number
  activeSubscriptions: number
  totalRevenue: number
  apiKeysCount: number
  monthlyGrowth: number
}

interface User {
  _id: string
  user_id: string
  email: string
  user_name: string
  created_time: string
  plan_type?: string
  last_login?: string
  status?: string
}

interface Coupon {
  _id: string
  code: string
  discount_type: string
  discount_value: number
  max_uses: number
  current_uses: number
  status: string
  expires_at: string
  created_at: string
  description: string
}

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Data states
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    apiKeysCount: 0,
    monthlyGrowth: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [adminLogs, setAdminLogs] = useState<any[]>([])
  
  // Modal states
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  // Check if user is admin
  const isAdmin = user?.userRole === 'ADMIN'

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchAdminData()
    }
  }, [isAuthenticated, isAdmin])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with Supabase admin data fetch
      // For now, using mock data
      const usersList: User[] = []
      const subscriptionsList: any[] = []
      const apiKeysList: any[] = []
      const transactionsList: any[] = []
      const couponsList: Coupon[] = []
      const logsList: any[] = []

      // Calculate stats
      const totalRevenue = transactionsList
        .filter((t: any) => t.status === 'succeeded')
        .reduce((sum: number, t: any) => sum + (t.amount / 100), 0)

      const activeSubscriptions = subscriptionsList.filter((s: any) => s.status === 'active').length

      setStats({
        totalUsers: usersList.length,
        activeSubscriptions,
        totalRevenue,
        apiKeysCount: apiKeysList.length,
        monthlyGrowth: 12.5 // Mock data
      })

      setUsers(usersList)
      setCoupons(couponsList)
      setTransactions(transactionsList)
      setAdminLogs(logsList)
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCoupon = async (couponData: any) => {
    try {
      // TODO: Replace with Supabase coupon creation
      const newCoupon = {
        _id: Date.now().toString(),
        ...couponData,
        current_uses: 0,
        status: 'active',
        created_by: user?.id,
        created_at: new Date().toISOString()
      }

      // TODO: Replace with Supabase admin log creation
      const logEntry = {
        _id: (Date.now() + 1).toString(),
        admin_id: user?.id,
        action: 'created_coupon',
        target_type: 'coupon',
        target_id: newCoupon._id,
        details: { coupon_code: couponData.code },
        timestamp: new Date().toISOString(),
        ip_address: '192.168.1.1' // In real app, get actual IP
      }

      setCoupons(prev => [newCoupon, ...prev])
      toast.success('Coupon created successfully')
      setShowCouponModal(false)
    } catch (error) {
      console.error('Failed to create coupon:', error)
      toast.error('Failed to create coupon')
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      try {
        setCoupons(prev => prev.filter(c => c._id !== couponId))
        toast.success('Coupon deleted successfully')
      } catch (error) {
        console.error('Failed to delete coupon:', error)
        toast.error('Failed to delete coupon')
      }
    }
  }

  // Access control
  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please login to access the admin dashboard</p>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login to Continue
          </button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'coupons', name: 'Coupons', icon: CreditCard },
    { id: 'transactions', name: 'Transactions', icon: DollarSign },
    { id: 'logs', name: 'Activity Logs', icon: Activity }
  ]

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive platform management and analytics
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+{stats.monthlyGrowth}%</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stats.activeSubscriptions}</p>
                <p className="text-sm text-gray-600">Active Subscriptions</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Key className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stats.apiKeysCount}</p>
                <p className="text-sm text-gray-600">API Keys</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { month: 'Jan', revenue: 1200 },
                    { month: 'Feb', revenue: 1800 },
                    { month: 'Mar', revenue: 2400 },
                    { month: 'Apr', revenue: 3200 },
                    { month: 'May', revenue: 2800 },
                    { month: 'Jun', revenue: 4100 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { month: 'Jan', users: 45 },
                    { month: 'Feb', users: 67 },
                    { month: 'Mar', users: 89 },
                    { month: 'Apr', users: 123 },
                    { month: 'May', users: 156 },
                    { month: 'Jun', users: 189 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users
                    .filter(u => 
                      u.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.user_name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user.user_name}</p>
                            <p className="text-sm text-gray-500">{user.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.plan_type || 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_time).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          View
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Suspend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Coupon Management</h2>
            <button
              onClick={() => setShowCouponModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{coupon.code}</p>
                          <p className="text-sm text-gray-500">{coupon.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.current_uses} / {coupon.max_uses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coupon.status === 'active' ? 'bg-green-100 text-green-800' :
                          coupon.status === 'expired' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {coupon.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(coupon.expires_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Transactions</h2>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.slice(0, 20).map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {transaction.stripe_payment_intent_id || transaction._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(transaction.amount / 100).toFixed(2)} {transaction.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {transaction.transaction_type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'logs' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Admin Activity Logs</h2>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminLogs.map((log) => (
                    <tr key={log._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.admin_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {log.action.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.target_type}: {log.target_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Coupon</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleCreateCoupon({
                code: formData.get('code'),
                discount_type: formData.get('discount_type'),
                discount_value: Number(formData.get('discount_value')),
                max_uses: Number(formData.get('max_uses')),
                expires_at: new Date(formData.get('expires_at') as string).toISOString(),
                description: formData.get('description')
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Code
                  </label>
                  <input
                    name="code"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type
                    </label>
                    <select
                      name="discount_type"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed_amount">Fixed Amount</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value
                    </label>
                    <input
                      name="discount_value"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Uses
                    </label>
                    <input
                      name="max_uses"
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expires At
                    </label>
                    <input
                      name="expires_at"
                      type="datetime-local"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
