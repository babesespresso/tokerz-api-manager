
import React, { useState, useEffect, useMemo } from 'react'
import {Plus, Copy, Trash2, Eye, EyeOff, RefreshCw, ChevronDown, ChevronUp, Edit2, Save, X, DollarSign, Activity, Clock, Search, Filter, Zap, Star} from 'lucide-react'
import { useApiKeys } from '../hooks/useApiKeys'
import { useSubscription } from '../hooks/useSubscription'
import { PROVIDER_CONFIGS, getProviderConfig, formatUsage, formatCurrency, formatPricing, searchProviders, getUniqueCategories, getUniqueCompanies, getAllProviders } from '../utils/providerConfig'
import { useTheme } from '../hooks/useTheme'
import toast from 'react-hot-toast'

type ProviderType = keyof typeof PROVIDER_CONFIGS

const ApiKeys = () => {
  const { resolvedTheme } = useTheme()
  const { apiKeys, loading, addApiKey, updateApiKey, deleteApiKey, keyTransactions, walletBalances } = useApiKeys()
  const { subscription } = useSubscription()
  const [showForm, setShowForm] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('openai-gpt4o')
  const [apiKey, setApiKey] = useState('')
  const [nickname, setNickname] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [filterProvider, setFilterProvider] = useState<string>('all')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [editingKeys, setEditingKeys] = useState<Set<string>>(new Set())
  const [editValues, setEditValues] = useState<Record<string, { key_name: string; usage_limit: number }>>({})
  
  // New search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterCompany, setFilterCompany] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'pricing' | 'popularity'>('name')

  const isDark = true // Force dark mode

  // Ensure apiKeys is always an array
  const safeApiKeys = Array.isArray(apiKeys) ? apiKeys : []

  // Category color mapping for visual identification
  const getCategoryColor = (category: string) => {
    const colors = {
      'text': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'multimodal': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'reasoning': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'image': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'audio': 'bg-green-500/20 text-green-300 border-green-500/30',
      'code': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'development': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'translation': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'vision': 'bg-red-500/20 text-red-300 border-red-500/30'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'suspended':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/30' // Default to active
    }
  }

  // Memoized filtered and sorted providers
  const filteredProviders = useMemo(() => {
    let providers = getAllProviders()
    
    // Apply search
    if (searchQuery.trim()) {
      providers = searchProviders(searchQuery)
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      providers = providers.filter(p => p.category === filterCategory)
    }
    
    // Apply company filter
    if (filterCompany !== 'all') {
      providers = providers.filter(p => p.company === filterCompany)
    }
    
    // Sort providers
    providers.sort((a, b) => {
      switch (sortBy) {
        case 'company':
          return a.company.localeCompare(b.company)
        case 'pricing':
          return (a.inputPricing || 0) - (b.inputPricing || 0)
        case 'popularity':
          // You could implement popularity based on usage stats
          return a.displayName.localeCompare(b.displayName)
        case 'name':
        default:
          return a.displayName.localeCompare(b.displayName)
      }
    })
    
    return providers
  }, [searchQuery, filterCategory, filterCompany, sortBy])

  const providerCategories = [
    { id: 'all', label: 'All Providers', count: safeApiKeys.length },
    { id: 'text', label: 'Text AI', count: safeApiKeys.filter(key => getProviderConfig(key?.provider)?.category === 'text').length },
    { id: 'multimodal', label: 'Multimodal', count: safeApiKeys.filter(key => getProviderConfig(key?.provider)?.category === 'multimodal').length },
    { id: 'reasoning', label: 'Reasoning', count: safeApiKeys.filter(key => getProviderConfig(key?.provider)?.category === 'reasoning').length },
    { id: 'image', label: 'Image AI', count: safeApiKeys.filter(key => getProviderConfig(key?.provider)?.category === 'image').length },
    { id: 'audio', label: 'Audio AI', count: safeApiKeys.filter(key => getProviderConfig(key?.provider)?.category === 'audio').length },
    { id: 'code', label: 'Code AI', count: safeApiKeys.filter(key => getProviderConfig(key?.provider)?.category === 'code').length },
    { id: 'development', label: 'Development', count: safeApiKeys.filter(key => getProviderConfig(key?.provider)?.category === 'development').length }
  ]

  const filteredApiKeys = safeApiKeys.filter(key => {
    if (!key) return false
    if (filterProvider === 'all') return true
    const config = getProviderConfig(key.provider)
    return config?.category === filterProvider
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim() || !nickname.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      await addApiKey({
        provider: selectedProvider,
        key_name: nickname.trim(),
        api_key: apiKey.trim()
      })
      
      setApiKey('')
      setNickname('')
      setShowForm(false)
      toast.success('API key added successfully!')
    } catch (error) {
      console.error('Failed to create API key:', error)
      toast.error('Failed to add API key')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!id || !confirm('Are you sure you want to delete this API key?')) return
    
    try {
      await deleteApiKey(id)
      toast.success('API key deleted successfully!')
    } catch (error) {
      console.error('Failed to delete API key:', error)
      toast.error('Failed to delete API key')
    }
  }

  const copyToClipboard = async (text: string) => {
    if (!text) {
      toast.error('No API key to copy')
      return
    }
    
    try {
      await navigator.clipboard.writeText(text)
      toast.success('API key copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy API key')
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    if (!keyId) return
    
    const newVisibleKeys = new Set(visibleKeys)
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId)
    } else {
      newVisibleKeys.add(keyId)
    }
    setVisibleKeys(newVisibleKeys)
  }

  const toggleCardExpansion = (keyId: string) => {
    if (!keyId) return
    
    const newExpandedCards = new Set(expandedCards)
    if (newExpandedCards.has(keyId)) {
      newExpandedCards.delete(keyId)
    } else {
      newExpandedCards.add(keyId)
    }
    setExpandedCards(newExpandedCards)
  }

  const startEditing = (key: any) => {
    if (!key?._id) return
    
    setEditingKeys(new Set([...editingKeys, key._id]))
    setEditValues({
      ...editValues,
      [key._id]: {
        key_name: key.key_name || '',
        usage_limit: key.usage_limit || 0
      }
    })
  }

  const cancelEditing = (keyId: string) => {
    const newEditingKeys = new Set(editingKeys)
    newEditingKeys.delete(keyId)
    setEditingKeys(newEditingKeys)
    
    const newEditValues = { ...editValues }
    delete newEditValues[keyId]
    setEditValues(newEditValues)
  }

  const saveEditing = async (keyId: string) => {
    if (!keyId || !editValues[keyId]) return
    
    try {
      await updateApiKey(keyId, editValues[keyId])
      
      const newEditingKeys = new Set(editingKeys)
      newEditingKeys.delete(keyId)
      setEditingKeys(newEditingKeys)
      
      const newEditValues = { ...editValues }
      delete newEditValues[keyId]
      setEditValues(newEditValues)
      
      toast.success('API key updated successfully!')
    } catch (error) {
      console.error('Failed to update API key:', error)
      toast.error('Failed to update API key')
    }
  }

  const maskApiKey = (key: string | undefined | null) => {
    if (!key || typeof key !== 'string') {
      return '••••••••••••••••'
    }
    
    if (key.length <= 8) return key
    return key.substring(0, 4) + '•'.repeat(Math.max(8, key.length - 8)) + key.substring(key.length - 4)
  }

  const canAddMoreKeys = () => {
    if (!subscription) return safeApiKeys.length < 3
    
    switch (subscription.plan_type) {
      case 'free': return safeApiKeys.length < 3
      case 'pro': return safeApiKeys.length < 10
      case 'enterprise': return safeApiKeys.length < 50
      default: return safeApiKeys.length < 3
    }
  }

  const ProviderLogo = ({ provider, displayName, color }: { provider: string, displayName: string, color: string }) => {
    const config = getProviderConfig(provider)
    const [imageError, setImageError] = useState(false)

    const handleImageError = () => {
      setImageError(true)
    }

    if (imageError || !config.logoUrl) {
      return (
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
          style={{ backgroundColor: color }}
        >
          {displayName?.charAt(0) || provider?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )
    }

    return (
      <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow-sm border border-gray-200">
        <img
          src={config.logoUrl}
          alt={`${displayName} logo`}
          className="w-6 h-6 object-contain"
          onError={handleImageError}
        />
      </div>
    )
  }

  const ProviderCard = ({ provider }: { provider: any }) => (
    <div 
      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
        selectedProvider === provider.name
          ? 'border-gray-500 bg-gray-800'
          : 'border-gray-600 hover:border-gray-500'
      }`}
      onClick={() => setSelectedProvider(provider.name)}
    >
      <div className="flex items-center space-x-2 mb-2">
        <ProviderLogo provider={provider.name} displayName={provider.displayName} color={provider.color} />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-white truncate">
            {provider.displayName}
          </h4>
          <p className="text-xs text-gray-400 truncate">
            {provider.company}
          </p>
        </div>
        {provider.inputPricing === 0 && (
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-bold text-gray-400">FREE</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getCategoryColor(provider.category)}`}>
            {provider.category}
          </span>
          {provider.inputPricing !== undefined && (
            <span className="text-xs font-bold text-gray-400">
              {formatPricing(provider.inputPricing)}
            </span>
          )}
        </div>
        
        <p className="text-xs text-gray-400 line-clamp-2">
          {provider.description}
        </p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-8 h-8 animate-spin text-white" />
          <span className="text-xl text-white">Loading API keys...</span>
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
            API Keys
          </h1>
          <p className="text-base text-gray-300">
            Manage your AI service provider API keys from 100+ providers
          </p>
        </div>

        {/* Provider Filter - Horizontal scrolling */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              {providerCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilterProvider(category.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    filterProvider === category.id
                      ? 'bg-gray-700 text-white shadow-md'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {category.label}
                  {category.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${
                      filterProvider === category.id
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {category.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add API Key Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={!canAddMoreKeys()}
            className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-md transition-all duration-300 ${
              canAddMoreKeys()
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700'
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add API Key
          </button>
          
          {!canAddMoreKeys() && (
            <p className="mt-2 text-sm text-gray-400">
              API key limit reached for your subscription tier
            </p>
          )}
        </div>

        {/* Add API Key Form */}
        {showForm && (
          <div className="bg-gray-900 border-gray-700 rounded-xl border shadow-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Add New API Key
            </h3>
            
            {/* Search and Filter Controls */}
            <div className="mb-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search providers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border-2 transition-all duration-200 bg-black border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 rounded-lg border-2 transition-all duration-200 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border-2 border-dashed border-gray-600">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-2 py-1 text-sm rounded-md border-2 bg-black border-gray-600 text-white"
                    >
                      <option value="all">All Categories</option>
                      {getUniqueCategories().map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Company
                    </label>
                    <select
                      value={filterCompany}
                      onChange={(e) => setFilterCompany(e.target.value)}
                      className="w-full px-2 py-1 text-sm rounded-md border-2 bg-black border-gray-600 text-white"
                    >
                      <option value="all">All Companies</option>
                      {getUniqueCompanies().map(company => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-2 py-1 text-sm rounded-md border-2 bg-black border-gray-600 text-white"
                    >
                      <option value="name">Name</option>
                      <option value="company">Company</option>
                      <option value="pricing">Pricing</option>
                      <option value="popularity">Popularity</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Provider Selection Grid */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white">
                  Select Provider ({filteredProviders.length} available)
                </h4>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-gray-400 hover:text-gray-300"
                  >
                    Clear search
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                {filteredProviders.map((provider) => (
                  <ProviderCard key={provider.name} provider={provider} />
                ))}
              </div>
              
              {filteredProviders.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No providers found matching your criteria</p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilterCategory('all')
                      setFilterCompany('all')
                    }}
                    className="mt-2 text-xs text-gray-400 hover:text-gray-300"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${getProviderConfig(selectedProvider).displayName} API key`}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 transition-all duration-200 bg-black border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                  required
                />
                <p className="mt-1 text-xs text-gray-400">
                  Expected format: {getProviderConfig(selectedProvider).apiKeyFormat}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nickname
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Give this key a memorable name"
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 transition-all duration-200 bg-black border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-md transition-all duration-300 bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add API Key'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 sm:flex-none px-4 py-2 border-2 text-sm font-semibold rounded-lg transition-all duration-300 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* API Keys List */}
        <div className="space-y-3">
          {filteredApiKeys.length === 0 ? (
            <div className="bg-gray-900 border-gray-700 rounded-xl border shadow-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                No API keys found
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {filterProvider === 'all' 
                  ? 'Add your first API key to get started'
                  : `No API keys found for ${providerCategories.find(c => c.id === filterProvider)?.label}`
                }
              </p>
              {canAddMoreKeys() && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-md transition-all duration-300 bg-gray-700 hover:bg-gray-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add API Key
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {filteredApiKeys.map((key) => {
                if (!key) return null
                
                const config = getProviderConfig(key.provider)
                const isVisible = visibleKeys.has(key._id || '')
                const isExpanded = expandedCards.has(key._id || '')
                const isEditing = editingKeys.has(key._id || '')
                const safeApiKey = key.encrypted_key || key.api_key || ''
                const transactions = keyTransactions[key._id || ''] || []
                const walletBalance = walletBalances[key._id || ''] || 0
                
                return (
                  <div
                    key={key._id || Math.random()}
                    className="bg-gray-900 border-gray-700 rounded-xl border shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    {/* Main Card Content */}
                    <div className="p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <ProviderLogo 
                          provider={key.provider} 
                          displayName={config?.displayName || key.provider} 
                          color={config?.color || '#6B7280'} 
                        />
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValues[key._id || '']?.key_name || ''}
                              onChange={(e) => setEditValues({
                                ...editValues,
                                [key._id || '']: {
                                  ...editValues[key._id || ''],
                                  key_name: e.target.value
                                }
                              })}
                              className="text-lg font-bold w-full px-2 py-1 rounded-lg border-2 bg-black border-gray-600 text-white"
                            />
                          ) : (
                            <h3 className="text-lg font-bold text-white mb-1 truncate">
                              {key.key_name || 'Unnamed Key'}
                            </h3>
                          )}
                          <p className="text-sm text-gray-400 mb-2">
                            {config?.displayName || key.provider || 'Unknown Provider'}
                          </p>
                          
                          {/* API Key display */}
                          <div className="flex items-center space-x-2 mb-3">
                            <code className="flex-1 min-w-0 px-2 py-1.5 text-xs rounded-lg font-mono break-all bg-black border border-gray-600 text-gray-300">
                              {isVisible ? safeApiKey : maskApiKey(safeApiKey)}
                            </code>
                            <button
                              onClick={() => toggleKeyVisibility(key._id || '')}
                              className="flex-shrink-0 p-1.5 rounded-lg border transition-all duration-200 border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800"
                              title={isVisible ? 'Hide API key' : 'Show API key'}
                            >
                              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(config?.category || 'other')}`}>
                              {config?.category || 'Other'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(key.status || 'active')}`}>
                              {key.status || 'Active'}
                            </span>
                            {isEditing ? (
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-semibold text-gray-400">Limit:</span>
                                <input
                                  type="number"
                                  value={editValues[key._id || '']?.usage_limit || 0}
                                  onChange={(e) => setEditValues({
                                    ...editValues,
                                    [key._id || '']: {
                                      ...editValues[key._id || ''],
                                      usage_limit: parseInt(e.target.value) || 0
                                    }
                                  })}
                                  className="w-16 px-1 py-0.5 text-xs rounded border bg-black border-gray-600 text-white"
                                />
                              </div>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-600">
                                {formatUsage(key.usage_limit || 0, config?.usageMetric || 'tokens')} limit
                              </span>
                            )}
                          </div>

                          {/* Usage and Wallet Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
                            <div className="flex items-center space-x-1">
                              <Activity className="w-3 h-3 text-gray-400" />
                              <span className="font-semibold text-gray-300">
                                {formatUsage(key.current_usage || 0, config?.usageMetric || 'tokens')} used
                              </span>
                            </div>
                            {config?.hasWalletBalance && (
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-3 h-3 text-gray-400" />
                                <span className="font-bold text-gray-300">
                                  {formatCurrency(walletBalance)} balance
                                </span>
                              </div>
                            )}
                            {key.last_used && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="font-semibold text-gray-300">
                                  {new Date(key.last_used).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEditing(key._id || '')}
                              className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg transition-all duration-200 bg-gray-700 hover:bg-gray-600 text-white shadow-md"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={() => cancelEditing(key._id || '')}
                              className="inline-flex items-center justify-center px-3 py-1.5 border text-xs font-semibold rounded-lg transition-all duration-200 border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => copyToClipboard(safeApiKey)}
                              className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg shadow-md transition-all duration-200 bg-gray-700 hover:bg-gray-600 text-white"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </button>
                            <button
                              onClick={() => startEditing(key)}
                              className="inline-flex items-center justify-center px-3 py-1.5 border text-xs font-semibold rounded-lg transition-all duration-200 border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(key._id || '')}
                              className="inline-flex items-center justify-center px-3 py-1.5 border text-xs font-semibold rounded-lg transition-all duration-200 border-gray-600 text-gray-400 hover:bg-gray-800"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>

                      {/* Expand/Collapse Button */}
                      <div className="pt-2 border-t border-gray-700">
                        <button
                          onClick={() => toggleCardExpansion(key._id || '')}
                          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-800"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-700 bg-gray-800/50 p-4">
                        <div className="grid grid-cols-1 gap-4">
                          {/* Transactions */}
                          <div>
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
                              <Activity className="w-4 h-4 mr-2" />
                              Recent Transactions
                            </h4>
                            {transactions.length > 0 ? (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {transactions.slice(0, 5).map((transaction, index) => (
                                  <div
                                    key={transaction._id || index}
                                    className="p-3 rounded-lg border bg-gray-900 border-gray-600"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={`text-xs font-bold ${
                                        transaction.transaction_type === 'usage'
                                          ? 'text-gray-400'
                                          : 'text-gray-400'
                                      }`}>
                                        {transaction.transaction_type?.toUpperCase()}
                                      </span>
                                      <span className="text-sm font-bold text-white">
                                        {formatCurrency(transaction.cost_usd || 0)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-400">
                                        {formatUsage(transaction.amount || 0, config?.usageMetric || 'tokens')}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {new Date(transaction.timestamp || '').toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-gray-400">
                                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No transactions yet</p>
                              </div>
                            )}
                          </div>

                          {/* Usage Stats */}
                          <div>
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              Usage & Balance
                            </h4>
                            
                            <div className="space-y-3">
                              {/* Usage Progress */}
                              <div className="p-3 rounded-lg border bg-gray-900 border-gray-600">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-300">
                                    Usage Progress
                                  </span>
                                  <span className="text-sm font-bold text-white">
                                    {((key.current_usage || 0) / (key.usage_limit || 1) * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${Math.min(100, (key.current_usage || 0) / (key.usage_limit || 1) * 100)}%`
                                    }}
                                  />
                                </div>
                                <div className="flex items-center justify-between mt-1 text-xs">
                                  <span className="text-gray-400">
                                    {formatUsage(key.current_usage || 0, config?.usageMetric || 'tokens')}
                                  </span>
                                  <span className="text-gray-400">
                                    {formatUsage(key.usage_limit || 0, config?.usageMetric || 'tokens')}
                                  </span>
                                </div>
                              </div>

                              {/* Key Stats */}
                              <div className="p-3 rounded-lg border bg-gray-900 border-gray-600">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                  <div>
                                    <div className="text-lg font-bold text-white">
                                      {transactions.length}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Transactions
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-white">
                                      {key.created_at ? Math.ceil((Date.now() - new Date(key.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Days Active
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApiKeys
