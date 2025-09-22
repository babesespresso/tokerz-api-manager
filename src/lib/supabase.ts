import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Auth helpers
export const auth = supabase.auth

// Database helpers
export const db = supabase
  .from('profiles')
  .select('*')

// Storage helpers
export const storage = supabase.storage

// Real-time helpers
export const subscribeToProfile = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`profile:${userId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, 
      callback
    )
    .subscribe()
}

export const subscribeToApiKeys = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`api_keys:${userId}`)
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'api_keys',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToUsageTransactions = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`usage:${userId}`)
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'usage_transactions',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

// Utility functions for common operations
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const uploadProfileImage = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Math.random()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export const getApiKeys = async (userId: string) => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createApiKey = async (keyData: any) => {
  const { data, error } = await supabase
    .from('api_keys')
    .insert([keyData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getUsageTransactions = async (userId: string, limit = 100) => {
  const { data, error } = await supabase
    .from('usage_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export const getUserSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

// Error handling helper
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  if (error.code === 'PGRST116') {
    return 'No data found'
  }
  
  if (error.code === '23505') {
    return 'This item already exists'
  }
  
  if (error.code === '23503') {
    return 'Referenced item not found'
  }
  
  return error.message || 'An unexpected error occurred'
}
