
import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'

interface User {
  userName?: string
  userRole?: string
  name?: string
  email?: string
  role?: string
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
        console.log('Initializing auth state...')
        
        // Check current authentication state
        const authState = lumi.auth.isAuthenticated
        const currentUser = lumi.auth.user
        
        console.log('Auth state:', authState)
        console.log('Current user:', currentUser)
        
        setIsAuthenticated(authState)
        setUser(currentUser)
        setError(null)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setError('Failed to initialize authentication')
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Set up auth change listener
    const unsubscribe = lumi.auth.onAuthChange((authUser) => {
      console.log('Auth change detected:', authUser)
      
      if (authUser) {
        // User is authenticated - merge with stored profile data
        const userDataKey = `tokerz_user_${(authUser as User).email || (authUser as User).userName || 'default'}`
        const storedData = JSON.parse(localStorage.getItem(userDataKey) || '{}')
        const mergedUser = { ...authUser, ...storedData } as User
        
        setIsAuthenticated(true)
        setUser(mergedUser)
        setError(null)
        console.log('User authenticated with stored data:', mergedUser.userName || mergedUser.name, mergedUser.userRole || mergedUser.role)
      } else {
        // User is not authenticated
        setIsAuthenticated(false)
        setUser(null)
        console.log('User not authenticated')
      }
      
      setLoading(false)
    })

    return () => {
      console.log('Cleaning up auth listener')
      unsubscribe()
    }
  }, [])

  const signIn = async () => {
    console.log('Sign in attempt started')
    setLoading(true)
    setError(null)
    
    try {
      // Verify lumi auth is available
      if (!lumi.auth || typeof lumi.auth.signIn !== 'function') {
        throw new Error('Lumi authentication is not properly configured')
      }

      console.log('Calling lumi.auth.signIn()...')
      await lumi.auth.signIn()
      console.log('Sign in call completed')
      
      // The onAuthChange listener will handle state updates
      // Don't manually set loading to false here - let the listener handle it
      
    } catch (error) {
      console.error('Sign in error:', error)
      
      let errorMessage = 'Authentication failed'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
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
      if (!lumi.auth || typeof lumi.auth.signOut !== 'function') {
        throw new Error('Lumi authentication is not properly configured')
      }

      await lumi.auth.signOut()
      console.log('Sign out completed')
      
      // Immediately clear local state to ensure user is signed out
      setIsAuthenticated(false)
      setUser(null)
      setLoading(false)
      
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

      // Update the user object with new data
      const updatedUser = { ...user, ...profileData }
      
      // Save to localStorage for persistence
      const userDataKey = `tokerz_user_${user.email || user.userName || 'default'}`
      const existingData = JSON.parse(localStorage.getItem(userDataKey) || '{}')
      const combinedData = { ...existingData, ...profileData }
      localStorage.setItem(userDataKey, JSON.stringify(combinedData))
      
      // Update local state immediately for better UX
      setUser(updatedUser)
      
      console.log('Profile updated successfully with localStorage persistence:', updatedUser)
      
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
    signOut,
    updateProfile
  }
}
