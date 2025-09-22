import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react'

interface AuthFormProps {
  onGoogleSignIn: () => void
  loading: boolean
  error?: string | null
}

const AuthForm: React.FC<AuthFormProps> = ({ onGoogleSignIn, loading, error }) => {
  const { signInWithEmail, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })
  const [formErrors, setFormErrors] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user starts typing
    if (formErrors) setFormErrors(null)
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setFormErrors('Email and password are required')
      return false
    }

    if (!formData.email.includes('@')) {
      setFormErrors('Please enter a valid email address')
      return false
    }

    if (formData.password.length < 6) {
      setFormErrors('Password must be at least 6 characters')
      return false
    }

    if (isSignUp) {
      if (!formData.displayName.trim()) {
        setFormErrors('Display name is required')
        return false
      }
      
      if (formData.password !== formData.confirmPassword) {
        setFormErrors('Passwords do not match')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setFormErrors(null)

    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.displayName)
        // Success message will be handled by the auth state change
      } else {
        await signInWithEmail(formData.email, formData.password)
        // Success redirect will be handled by the auth state change
      }
    } catch (error) {
      console.error('Auth form error:', error)
      if (error instanceof Error) {
        setFormErrors(error.message)
      } else {
        setFormErrors(isSignUp ? 'Sign up failed' : 'Sign in failed')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    setFormErrors(null)
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    })
  }

  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-gray-300">
          {isSignUp 
            ? 'Start managing your API keys securely' 
            : 'Sign in to your Tokerz account'
          }
        </p>
      </div>

      {/* Google OAuth Button */}
      <button
        onClick={onGoogleSignIn}
        disabled={loading || isSubmitting}
        className="w-full flex items-center justify-center px-4 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mb-6 shadow-lg"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
        ) : (
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Continue with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/30"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-transparent text-gray-300">or</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Your name"
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              placeholder="your@email.com"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Error Messages */}
        {(formErrors || error) && (
          <div className="flex items-center p-3 bg-red-900/50 border border-red-500/50 rounded-lg backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
            <p className="text-red-300 text-sm">
              {formErrors || error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <ArrowRight className="w-5 h-5 mr-2" />
          )}
          {isSubmitting 
            ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
            : (isSignUp ? 'Create Account' : 'Sign In')
          }
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={switchMode}
          disabled={isSubmitting || loading}
          className="text-gray-300 hover:text-white transition-colors disabled:opacity-50"
        >
          {isSignUp 
            ? 'Already have an account? Sign in' 
            : "Don't have an account? Sign up"
          }
        </button>
      </div>

      {!isSignUp && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {/* TODO: Implement forgot password */}}
            disabled={isSubmitting || loading}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            Forgot your password?
          </button>
        </div>
      )}
    </div>
  )
}

export default AuthForm
