import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

interface Subscription {
  _id: string
  user_id: string
  plan_type: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'canceled' | 'expired' | 'trial'
  max_api_keys: number
  monthly_fee: number
  billing_cycle: 'monthly' | 'yearly'
  started_at: string
  expires_at: string
  next_payment?: string
}

export function useSubscription() {
  const { user, isAuthenticated } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    try {
      // TODO: Replace with Supabase subscription fetch
      // For now, create a default free subscription
      const freeSubscription: Subscription = {
        _id: 'default-free',
        user_id: user.id,
        plan_type: 'free',
        status: 'active',
        max_api_keys: 1,
        monthly_fee: 0,
        billing_cycle: 'monthly',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
      setSubscription(freeSubscription)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
      toast.error('Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const upgradePlan = async (planType: 'pro' | 'enterprise') => {
    if (!user || !subscription) return

    try {
      const planConfig = {
        pro: { max_api_keys: 10, monthly_fee: 29.99 },
        enterprise: { max_api_keys: 50, monthly_fee: 99.99 }
      }

      // TODO: Replace with Supabase subscription update
      const updatedSubscription: Subscription = {
        ...subscription,
        plan_type: planType,
        ...planConfig[planType],
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        next_payment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      setSubscription(updatedSubscription)
      toast.success(`Upgraded to ${planType.toUpperCase()} plan!`)
    } catch (error) {
      console.error('Failed to upgrade plan:', error)
      toast.error('Failed to upgrade plan')
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  return {
    subscription,
    loading,
    fetchSubscription,
    upgradePlan
  }
}
