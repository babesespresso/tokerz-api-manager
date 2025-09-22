
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { lumi } from '../lib/lumi'
import {CreditCard, Check, X, Star, Zap, Shield, Crown, Users, BarChart3, Clock, RefreshCw} from 'lucide-react'
import toast from 'react-hot-toast'

const Subscription = () => {
  const { user } = useAuth()
  const { subscription, loading } = useSubscription()
  const [isProcessing, setIsProcessing] = useState(false)

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'month',
      description: 'Perfect for getting started',
      icon: Star,
      features: [
        'Up to 3 API keys',
        'Basic usage analytics',
        'Community support',
        '1,000 tokens/month included',
        'Standard rate limits'
      ],
      limitations: [
        'Limited to 3 providers',
        'Basic support only',
        'No priority access'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      period: 'month',
      description: 'For professional developers',
      icon: Zap,
      popular: true,
      features: [
        'Up to 10 API keys',
        'Advanced analytics & insights',
        'Priority support',
        '10,000 tokens/month included',
        'Higher rate limits',
        'Usage optimization tips',
        'Custom usage alerts'
      ],
      limitations: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      period: 'month',
      description: 'For teams and organizations',
      icon: Crown,
      features: [
        'Unlimited API keys',
        'Team management',
        'Advanced security features',
        'Dedicated support',
        '100,000 tokens/month included',
        'Custom integrations',
        'SLA guarantees',
        'Advanced reporting'
      ],
      limitations: []
    }
  ]

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Please login to subscribe')
      return
    }

    setIsProcessing(true)
    try {
      // This would typically create a Stripe checkout session
      toast.success(`Subscribing to ${planId} plan...`)
      // Implement actual subscription logic here
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Failed to process subscription')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return

    setIsProcessing(true)
    try {
      // Implement cancellation logic
      toast.success('Subscription cancelled successfully')
    } catch (error) {
      console.error('Cancellation error:', error)
      toast.error('Failed to cancel subscription')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-8 h-8 animate-spin text-white" />
          <span className="text-xl text-white">Loading subscription...</span>
        </div>
      </div>
    )
  }

  const currentPlan = subscription?.plan_type || 'free'

  return (
    <div className="flex-1 bg-black overflow-auto min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Subscription Plans
          </h1>
          <p className="text-base text-gray-300">
            Choose the perfect plan for your API management needs
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <div className="mb-8 bg-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Current Subscription</h3>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white capitalize">{currentPlan}</span>
                  <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                {subscription.next_billing_date && (
                  <p className="text-sm text-gray-400 mt-2">
                    Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              {currentPlan !== 'free' && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrentPlan = currentPlan === plan.id
            
            return (
              <div
                key={plan.id}
                className={`relative bg-gray-900 rounded-xl border p-6 transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? 'border-gray-500 shadow-lg'
                    : 'border-gray-700'
                } ${isCurrentPlan ? 'ring-2 ring-gray-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400 ml-1">/{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Features included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <X className="w-4 h-4 text-gray-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-400">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || isProcessing}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    isCurrentPlan
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-md'
                      : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : `Subscribe to ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Can I change my plan anytime?
                </h3>
                <p className="text-gray-400">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated based on your billing cycle.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  What happens if I exceed my token limit?
                </h3>
                <p className="text-gray-400">
                  You'll be charged for additional tokens at standard rates. We'll notify you before you reach your limit.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Is there a free trial for paid plans?
                </h3>
                <p className="text-gray-400">
                  All new users start with our free plan. You can upgrade anytime to access additional features.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  How does billing work?
                </h3>
                <p className="text-gray-400">
                  We bill monthly or annually based on your preference. All payments are processed securely through Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Subscription
