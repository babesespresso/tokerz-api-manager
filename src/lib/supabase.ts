import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Handle mock authentication with valid dummy URLs
const getSupabaseUrl = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL
  // Use dummy URL for mock authentication (won't be used anyway)
  if (envUrl === 'your-project-url') {
    return 'https://mock-project.supabase.co'
  }
  return envUrl || 'https://zmyxqkjafhercgnjwrgk.supabase.co'
}

const getSupabaseKey = () => {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  // Use dummy key for mock authentication (won't be used anyway)
  if (envKey === 'your-anon-key') {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2siLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NzUwNDAwMCwiZXhwIjoxOTk5OTk5OTk5fQ.mock'
  }
  return envKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpteXhxa2phZmhlcmNnbmp3cmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1Njc3MjIsImV4cCI6MjA3NDE0MzcyMn0.V3TBMwlTiQB53e7swAedJc0x67OFERB06yDeHCRs7oI'
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  getSupabaseUrl(),
  getSupabaseKey()
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

// Type for profile data
export interface ProfileData {
  id: string
  display_name: string | null
  email: string
  avatar_url: string | null
  timezone: string
  language: string
  user_role: string
  created_at: string
  updated_at: string
}

export const getProfile = async (userId: string): Promise<ProfileData> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data as ProfileData
}

export const updateProfile = async (userId: string, updates: Partial<ProfileData>): Promise<ProfileData> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as ProfileData
}

export const uploadProfileImage = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // First, try to delete any existing avatar for this user
  try {
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(userId)
    
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`)
      await supabase.storage
        .from('avatars')
        .remove(filesToDelete)
    }
  } catch (error) {
    console.log('No existing files to delete or error cleaning up:', error)
  }

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    throw new Error(`Failed to upload image: ${uploadError.message}`)
  }

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
    .insert(keyData as any)
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
