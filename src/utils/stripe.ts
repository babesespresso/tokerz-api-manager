
// Stripe configuration for Tokerz platform
// This file handles Stripe initialization and payment processing

export interface StripeConfig {
  publishableKey: string
  secretKey?: string
  webhookSecret?: string
}

// Stripe configuration - you'll need to provide these values
export const stripeConfig: StripeConfig = {
  // Replace with your actual Stripe publishable key
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_PUBLISHABLE_KEY_HERE',
  
  // Note: Secret key should be handled on the backend only
  // This is just for reference - NEVER expose secret keys in frontend
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY_HERE',
  
  // Webhook secret for verifying Stripe events
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_YOUR_WEBHOOK_SECRET_HERE'
}

// Price IDs for your Stripe products
export const stripePriceIds = {
  pro_monthly: process.env.REACT_APP_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_YOUR_PRO_MONTHLY_PRICE_ID',
  enterprise_monthly: process.env.REACT_APP_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_YOUR_ENTERPRISE_MONTHLY_PRICE_ID',
  tokens_1000: process.env.REACT_APP_STRIPE_TOKENS_1000_PRICE_ID || 'price_YOUR_TOKENS_1000_PRICE_ID',
  tokens_5000: process.env.REACT_APP_STRIPE_TOKENS_5000_PRICE_ID || 'price_YOUR_TOKENS_5000_PRICE_ID',
  tokens_10000: process.env.REACT_APP_STRIPE_TOKENS_10000_PRICE_ID || 'price_YOUR_TOKENS_10000_PRICE_ID'
}

// Stripe payment processing functions
export const createPaymentIntent = async (amount: number, currency: string = 'usd', metadata: any = {}) => {
  try {
    // This should be called from your backend
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        metadata
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to create payment intent')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

export const validateStripeConfig = () => {
  const missingKeys = []
  
  if (!stripeConfig.publishableKey || stripeConfig.publishableKey.includes('YOUR_')) {
    missingKeys.push('REACT_APP_STRIPE_PUBLISHABLE_KEY')
  }
  
  if (missingKeys.length > 0) {
    console.warn('Missing Stripe configuration:', missingKeys.join(', '))
    return false
  }
  
  return true
}
