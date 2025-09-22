
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
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
      const { list } = await lumi.entities.user_subscriptions.list({
        filter: { user_id: user.userId },
        sort: { started_at: -1 }
      })
      
      if (list && list.length > 0) {
        setSubscription(list[0])
      } else {
        // Create free subscription if none exists
        const freeSubscription = await lumi.entities.user_subscriptions.create({
          user_id: user.userId,
          plan_type: 'free',
          status: 'active',
          max_api_keys: 1,
          monthly_fee: 0,
          billing_cycle: 'monthly',
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
        setSubscription(freeSubscription)
      }
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

      const updatedSubscription = await lumi.entities.user_subscriptions.update(
        subscription._id,
        {
          plan_type: planType,
          ...planConfig[planType],
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          next_payment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      )
      
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
