
import { useState, useEffect } from 'react'
import { supabase, getCurrentUser, getProfile, updateProfile as updateSupabaseProfile } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  display_name?: string | null
  avatar_url?: string | null
  timezone?: string
  language?: string
  user_role?: string
  profileImage?: string | null
  userName?: string
  name?: string
  [key: string]: any
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log('Initializing Supabase auth state...')
        
        // Check if we have valid Supabase credentials
        if (import.meta.env.VITE_SUPABASE_URL === 'your-project-url' || 
            import.meta.env.VITE_SUPABASE_ANON_KEY === 'your-anon-key') {
          console.log('Using mock authentication - Supabase not configured')
          
          // Create a mock user for development/testing
          const mockUser: User = {
            id: 'mock-user-123',
            email: 'demo@example.com',
            display_name: 'Demo User',
            userName: 'Demo User',
            name: 'Demo User',
            user_role: 'member',
            profileImage: null
          }
          
          setIsAuthenticated(true)
          setUser(mockUser)
          setError(null)
          setLoading(false)
          return
        }
        
        const currentUser = await getCurrentUser()
        
        if (currentUser) {
          console.log('User found, using basic auth data immediately')
          
          // Use basic user data immediately to prevent loading issues
          const basicUser: User = {
            id: currentUser.id,
            email: currentUser.email!,
            display_name: currentUser.email?.split('@')[0],
            userName: currentUser.email?.split('@')[0],
            name: currentUser.email?.split('@')[0],
            user_role: 'member'
          }
          setIsAuthenticated(true)
          setUser(basicUser)
          console.log('User authenticated with basic data:', basicUser.email, basicUser.user_role)
          
          // Try to load profile data in background (non-blocking)
          setTimeout(async () => {
            try {
              console.log('Background loading profile from database (initialization)...')
              const profile = await getProfile(currentUser.id)
              console.log('Profile loaded from database:', profile)
              
              const fullUser: User = {
                id: profile.id,
                email: profile.email,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url,
                timezone: profile.timezone,
                language: profile.language,
                user_role: profile.user_role,
                userName: profile.display_name || profile.email?.split('@')[0],
                name: profile.display_name || profile.email?.split('@')[0],
                profileImage: profile.avatar_url
              }
              
              setUser(fullUser)
              console.log('User profile updated with full data (initialization):', fullUser.email, 'Profile image:', fullUser.profileImage)
            } catch (profileError) {
              console.log('Could not load profile from database (initialization):', profileError)
              // Keep the basic user data if profile loading fails
            }
          }, 100)
        } else {
          setIsAuthenticated(false)
          setUser(null)
          console.log('No authenticated user found')
        }
        
        setError(null)
      } catch (error) {
        console.error('Error initializing auth:', error)
        
        // Only use mock authentication in true development mode (when explicitly configured)
        if (import.meta.env.VITE_SUPABASE_URL === 'your-project-url' || 
            import.meta.env.VITE_SUPABASE_ANON_KEY === 'your-anon-key') {
          console.log('Using mock authentication for development')
          const mockUser: User = {
            id: 'mock-user-123',
            email: 'demo@example.com',
            display_name: 'Demo User',
            userName: 'Demo User', 
            name: 'Demo User',
            user_role: 'member',
            profileImage: null
          }
          
          setIsAuthenticated(true)
          setUser(mockUser)
          setError(null)
        } else {
          // For real Supabase setup, don't fall back to mock - show landing page
          console.log('Authentication failed, showing landing page')
          setError(null) // Don't show error to user, just show landing
          setIsAuthenticated(false)
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('Auth state changed to SIGNED_IN, using basic user data for now')
        
        // Use basic user data immediately to prevent loading state issues
        const basicUser: User = {
          id: session.user.id,
          email: session.user.email!,
          display_name: session.user.email?.split('@')[0],
          userName: session.user.email?.split('@')[0],
          name: session.user.email?.split('@')[0],
          user_role: 'member'
        }
        setIsAuthenticated(true)
        setUser(basicUser)
        setError(null)
        console.log('User signed in with basic data:', basicUser.email)
        
        // Try to load profile data in background (non-blocking)
        setTimeout(async () => {
          try {
            console.log('Background loading profile from database...')
            const profile = await getProfile(session.user.id)
            console.log('Profile loaded from database on sign in:', profile)
            
            const fullUser: User = {
              id: profile.id,
              email: profile.email,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
              timezone: profile.timezone,
              language: profile.language,
              user_role: profile.user_role,
              userName: profile.display_name || profile.email?.split('@')[0],
              name: profile.display_name || profile.email?.split('@')[0],
              profileImage: profile.avatar_url
            }
            
            setUser(fullUser)
            console.log('User profile updated with full data:', fullUser.email, 'Profile image:', fullUser.profileImage)
          } catch (profileError) {
            console.log('Could not load profile from database:', profileError)
            // Keep the basic user data if profile loading fails
          }
        }, 100)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setUser(null)
        console.log('User signed out')
      }
      
      setLoading(false)
    })

    return () => {
      console.log('Cleaning up auth listener')
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async () => {
    console.log('Sign in with Supabase started')
    setLoading(true)
    setError(null)
    
    try {
      // Check if we're using mock authentication
      if (import.meta.env.VITE_SUPABASE_URL === 'your-project-url' || 
          import.meta.env.VITE_SUPABASE_ANON_KEY === 'your-anon-key') {
        console.log('Mock authentication - simulating sign in')
        
        // For mock authentication, just set authenticated state
        const mockUser: User = {
          id: 'mock-user-123',
          email: 'demo@example.com',
          display_name: 'Demo User',
          userName: 'Demo User',
          name: 'Demo User',
          user_role: 'member',
          profileImage: null
        }
        
        setIsAuthenticated(true)
        setUser(mockUser)
        setError(null)
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      
      if (error) throw error
      
      console.log('OAuth sign in initiated')
      // Don't set loading to false here - the auth state change will handle it
      
    } catch (error) {
      console.error('Sign in error:', error)
      
      let errorMessage = 'Authentication failed'
      
      if (error instanceof Error) {
        if (error.message.includes('provider is not enabled')) {
          errorMessage = 'Google authentication is not enabled. Please enable Google OAuth in your Supabase project settings under Authentication > Providers.'
        } else if (error.message.includes('validation_failed')) {
          errorMessage = 'Authentication configuration error. Please check your Supabase project settings.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      setLoading(false)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    console.log('Email sign in attempt started')
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      console.log('Email sign in successful')
      // Auth state change listener will handle the rest
      
    } catch (error) {
      console.error('Email sign in error:', error)
      
      let errorMessage = 'Email authentication failed'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    console.log('Sign up attempt started')
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      })
      
      if (error) throw error
      
      console.log('Sign up successful - check email for verification')
      // Auth state change listener will handle the rest
      
    } catch (error) {
      console.error('Sign up error:', error)
      
      let errorMessage = 'Sign up failed'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    console.log('Sign out attempt started')
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      console.log('Sign out completed')
      // Auth state change listener will handle clearing state
      
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if sign out fails, clear local state
      setIsAuthenticated(false)
      setUser(null)
      setError(error instanceof Error ? error.message : 'Sign out failed')
      setLoading(false)
      throw error
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    console.log('Update profile attempt started', profileData)
    setLoading(true)
    setError(null)
    
    try {
      if (!user) {
        throw new Error('No user authenticated')
      }

      // Check if we're using mock authentication
      if (import.meta.env.VITE_SUPABASE_URL === 'your-project-url' || 
          import.meta.env.VITE_SUPABASE_ANON_KEY === 'your-anon-key' ||
          user.id === 'mock-user-123') {
        console.log('Using mock profile update')
        
        // For mock authentication, just update local state
        const updatedUser = { ...user, ...profileData }
        setUser(updatedUser)
        
        console.log('Mock profile updated successfully:', updatedUser)
        
        // Return the profile data as if it came from database
        return profileData
      }

      // Map frontend field names to database column names
      const dbProfileData = { ...profileData }
      
      // Map profileImage to avatar_url for database compatibility
      if (profileData.profileImage !== undefined) {
        dbProfileData.avatar_url = profileData.profileImage
        delete dbProfileData.profileImage
      }
      
      // Map userName to display_name for database compatibility
      if (profileData.userName !== undefined) {
        dbProfileData.display_name = profileData.userName
        delete dbProfileData.userName
      }
      
      // Remove any other frontend-only fields that don't exist in database
      delete dbProfileData.name

      // Update profile in Supabase database
      const updatedProfile = await updateSupabaseProfile(user.id, dbProfileData)
      
      // Map database fields back to frontend format with proper type handling
      const mappedProfile = { 
        ...updatedProfile,
        userName: updatedProfile.display_name || undefined,
        profileImage: updatedProfile.avatar_url || undefined
      }
      
      // Update local user state with both database and frontend fields for compatibility
      const updatedUser = { 
        ...user, 
        ...mappedProfile
      } as User
      
      // Force a complete state refresh to ensure all components re-render
      setUser(null)
      setTimeout(() => {
        setUser(updatedUser)
      }, 0)
      
      console.log('Profile updated successfully:', updatedUser)
      
      return updatedProfile
    } catch (error) {
      console.error('Profile update error:', error)
      
      let errorMessage = 'Failed to update profile'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { 
    user, 
    isAuthenticated, 
    loading, 
    error,
    signIn,
    signInWithEmail,
    signUp,
    signOut,
    updateProfile
  }
}
