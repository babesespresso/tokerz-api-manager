
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useApiKeyGeneration } from '../hooks/useApiKeyGeneration'
import { useTokenBalance } from '../hooks/useTokenBalance'
import {Coins, ShoppingCart, Star, Zap, Gift, CreditCard, DollarSign, TrendingUp, Package, Sparkles, Crown, Target} from 'lucide-react'
import toast from 'react-hot-toast'

const TokenStore = () => {
  const { user } = useAuth()
  const { generateApiKey, loading: generationLoading } = useApiKeyGeneration()
  const { balance, loading: balanceLoading, purchaseTokens } = useTokenBalance()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const tokenPackages = [
    {
      id: 'starter',
      name: 'Starter Pack',
      tokens: 10000,
      price: 9.99,
      bonus: 0,
      popular: false,
      icon: Package,
      description: 'Perfect for small projects',
      features: ['10,000 tokens', 'No expiration', 'All providers supported']
    },
    {
      id: 'professional',
      name: 'Professional Pack',
      tokens: 50000,
      price: 39.99,
      bonus: 5000,
      popular: true,
      icon: Sparkles,
      description: 'Most popular choice',
      features: ['50,000 tokens', '5,000 bonus tokens', 'Priority support', 'No expiration']
    },
    {
      id: 'enterprise',
      name: 'Enterprise Pack',
      tokens: 200000,
      price: 149.99,
      bonus: 30000,
      popular: false,
      icon: Crown,
      description: 'For large scale operations',
      features: ['200,000 tokens', '30,000 bonus tokens', 'Dedicated support', 'Custom integrations']
    }
  ]

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast.error('Please login to purchase tokens')
      return
    }

    const selectedPkg = tokenPackages.find(pkg => pkg.id === packageId)
    if (!selectedPkg) return

    setIsProcessing(true)
    try {
      await purchaseTokens(selectedPkg.tokens + selectedPkg.bonus, selectedPkg.price)
      toast.success(`Successfully purchased ${(selectedPkg.tokens + selectedPkg.bonus).toLocaleString()} tokens!`)
      setSelectedPackage(null)
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Failed to process purchase')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateKey = async (provider: string) => {
    if (!user) {
      toast.error('Please login to generate API keys')
      return
    }

    try {
      const result = await generateApiKey(provider)
      toast.success(`Generated API key for ${provider}`)
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate API key')
    }
  }

  return (
    <div className="flex-1 bg-black overflow-auto min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Token Store
          </h1>
          <p className="text-base text-gray-300">
            Purchase tokens to use across all supported AI providers
          </p>
        </div>

        {/* Current Balance */}
        <div className="mb-8 bg-gray-900 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-800 rounded-lg">
                <Coins className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Current Balance</h3>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white">
                    {balanceLoading ? '...' : balance?.toLocaleString() || '0'}
                  </span>
                  <span className="text-gray-400">tokens</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">Estimated Value</p>
              <p className="text-xl font-bold text-white">
                ${((balance || 0) * 0.001).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Token Packages */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Purchase Token Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tokenPackages.map((pkg) => {
              const Icon = pkg.icon
              const totalTokens = pkg.tokens + pkg.bonus
              const pricePerToken = pkg.price / totalTokens
              
              return (
                <div
                  key={pkg.id}
                  className={`relative bg-gray-900 rounded-xl border p-6 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                    pkg.popular
                      ? 'border-gray-500 shadow-lg'
                      : 'border-gray-700'
                  } ${selectedPackage === pkg.id ? 'ring-2 ring-gray-500' : ''}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mb-4">
                      <Icon className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-white">${pkg.price}</span>
                      </div>
                      <div className="text-gray-300">
                        <span className="text-lg font-semibold">{pkg.tokens.toLocaleString()}</span>
                        <span className="text-gray-400"> tokens</span>
                        {pkg.bonus > 0 && (
                          <div className="text-sm text-gray-400">
                            + {pkg.bonus.toLocaleString()} bonus tokens
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${(pricePerToken * 1000).toFixed(2)} per 1K tokens
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePurchase(pkg.id)
                    }}
                    disabled={isProcessing}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                      pkg.popular
                        ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-md'
                        : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      {isProcessing ? 'Processing...' : 'Purchase Package'}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-800 rounded-lg">
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-semibold text-white">This Month</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Tokens Used</span>
                <span className="text-white font-medium">12,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cost Saved</span>
                <span className="text-white font-medium">$8.32</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Target className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-semibold text-white">Most Used</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Provider</span>
                <span className="text-white font-medium">OpenAI GPT-4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Usage</span>
                <span className="text-white font-medium">8,200 tokens</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Zap className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-semibold text-white">Efficiency</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Avg. Cost/1K</span>
                <span className="text-white font-medium">$0.67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Savings</span>
                <span className="text-white font-medium">23%</span>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6">How Token Store Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mb-4">
                <ShoppingCart className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">1. Purchase Tokens</h3>
              <p className="text-gray-400 text-sm">
                Buy token packages at discounted rates with bonus tokens included
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mb-4">
                <Zap className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">2. Use Across Providers</h3>
              <p className="text-gray-400 text-sm">
                Use your tokens with any supported AI provider through our unified API
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mb-4">
                <DollarSign className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">3. Save Money</h3>
              <p className="text-gray-400 text-sm">
                Enjoy lower rates and simplified billing across all your AI services
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenStore
