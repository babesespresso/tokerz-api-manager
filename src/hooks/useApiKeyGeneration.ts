import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'
import { useSubscription } from '../hooks/useSubscription'

interface GeneratedApiKey {
  _id: string
  user_id: string
  key_name: string
  key_hash: string
  key_preview: string
  permissions: string[]
  last_used?: string
  expires_at?: string
  created_at: string
}

export function useApiKeyGeneration() {
  const { user, isAuthenticated } = useAuth()
  const { subscription } = useSubscription()
  const [apiKeys, setApiKeys] = useState<GeneratedApiKey[]>([])
  const [loading, setLoading] = useState(false)

  const fetchGeneratedKeys = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    try {
      // TODO: Replace with Supabase generated API keys fetch
      setApiKeys([])
    } catch (error) {
      console.error('Failed to fetch generated API keys:', error)
      toast.error('Failed to load generated API keys')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const generateApiKey = async (keyName: string, permissions: string[] = ['read']) => {
    if (!user || !subscription) return

    // Check subscription limits
    if (apiKeys.length >= subscription.max_api_keys) {
      toast.error(`You've reached the maximum of ${subscription.max_api_keys} API keys for your ${subscription.plan_type} plan`)
      return
    }

    try {
      setLoading(true)

      // Generate a random API key
      const apiKey = generateRandomApiKey()
      const keyHash = await hashApiKey(apiKey)
      const keyPreview = `${apiKey.slice(0, 7)}...${apiKey.slice(-6)}`

      // TODO: Replace with Supabase generated API key creation
      const newKey: GeneratedApiKey = {
        _id: Date.now().toString(),
        user_id: user.id,
        key_name: keyName,
        key_hash: keyHash,
        key_preview: keyPreview,
        permissions,
        created_at: new Date().toISOString()
      }

      setApiKeys(prev => [newKey, ...prev])
      toast.success('API key generated successfully')

      return { ...newKey, key: apiKey } // Return full key only once
    } catch (error) {
      console.error('Failed to generate API key:', error)
      toast.error('Failed to generate API key')
    } finally {
      setLoading(false)
    }
  }

  const revokeApiKey = async (keyId: string) => {
    try {
      // TODO: Replace with Supabase API key revocation
      setApiKeys(prev => prev.filter(key => key._id !== keyId))
      toast.success('API key revoked successfully')
    } catch (error) {
      console.error('Failed to revoke API key:', error)
      toast.error('Failed to revoke API key')
    }
  }

  const updateKeyPermissions = async (keyId: string, permissions: string[]) => {
    try {
      // TODO: Replace with Supabase API key update
      setApiKeys(prev => prev.map(key => 
        key._id === keyId ? { ...key, permissions } : key
      ))
      toast.success('API key permissions updated successfully')
    } catch (error) {
      console.error('Failed to update API key permissions:', error)
      toast.error('Failed to update API key permissions')
    }
  }

  useEffect(() => {
    fetchGeneratedKeys()
  }, [fetchGeneratedKeys])

  return {
    apiKeys,
    loading,
    generateApiKey,
    revokeApiKey,
    updateKeyPermissions,
    fetchGeneratedKeys
  }
}

// Helper functions
function generateRandomApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'tk_'
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
