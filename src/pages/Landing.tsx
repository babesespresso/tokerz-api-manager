
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import {Key, Shield, BarChart3, Zap, Check, ArrowRight, Star, Globe, Lock} from 'lucide-react'

const Landing: React.FC = () => {
  const { signIn, loading, error } = useAuth()

  const handleSignIn = async () => {
    try {
      console.log('Landing: Starting sign in process')
      await signIn()
      console.log('Landing: Sign in process completed successfully')
    } catch (error) {
      console.error('Landing: Login failed:', error)
    }
  }

  const features = [
    {
      icon: Shield,
      title: 'Secure Storage',
      description: 'Your API keys are encrypted and stored with bank-level security'
    },
    {
      icon: BarChart3,
      title: 'Usage Analytics',
      description: 'Track usage, costs, and performance across all your services'
    },
    {
      icon: Zap,
      title: 'Token Marketplace',
      description: 'Buy tokens with competitive rates and thin margins above provider costs'
    },
    {
      icon: Globe,
      title: 'Multi-Provider Support',
      description: 'Manage keys for OpenAI, Claude, Gemini, and popular IDE plugins'
    }
  ]

  const providers = [
    'OpenAI', 'Claude', 'Google Gemini', 'Cline', 'RooCode', 
    'Kilo Code', 'GitHub Copilot', 'Cursor', 'Windsurf'
  ]

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out Tokerz',
      features: [
        '1 API key',
        'Basic usage tracking',
        'Standard support',
        'Token marketplace access'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$29.99',
      period: 'per month',
      description: 'For developers and small teams',
      features: [
        '10 API keys',
        'Advanced analytics',
        'Priority support',
        'Token marketplace access',
        'Usage alerts',
        'Export data'
      ],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99.99',
      period: 'per month',
      description: 'For large teams and organizations',
      features: [
        '50 API keys',
        'Team management',
        'Custom analytics',
        'Dedicated support',
        'Token marketplace access',
        'API access',
        'Custom integrations'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section with Dynamic Background */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Dynamic Video Background with Fallback */}
        <div className="absolute inset-0 w-full h-full">
          {/* HTML5 Video Background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1668681919287-7367677cdc4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4NTV8MHwxfHNlYXJjaHwyNXx8YWJzdHJhY3R8ZW58MHx8fHwxNzU4Mzk5MDI1fDA&ixlib=rb-4.1.0&q=80&w=1920"
          >
            <source src="/Futurewave Background 01.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1668681919287-7367677cdc4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU4NTV8MHwxfHNlYXJjaHwyNXx8YWJzdHJhY3R8ZW58MHx8fHwxNzU4Mzk5MDI1fDA&ixlib=rb-4.1.0&q=80&w=1920')`
              }}
            ></div>
          </video>
          
          {/* Animated overlay for dynamic effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/70 to-indigo-900/70 animate-pulse"></div>
          
          {/* Gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-purple-900/60 to-indigo-900/60"></div>
          
          {/* Animated grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))] animate-pulse"></div>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm bg-white/10 animate-pulse">
                <Key className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg animate-fade-in">
              Secure AI API Key
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Management Platform
              </span>
            </h1>
            
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md animate-fade-in-delay">
              Store, monitor, and manage all your AI service API keys in one secure platform. 
              Track usage, control costs, and buy tokens at competitive rates.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-delay-2">
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 backdrop-blur-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
              <button className="inline-flex items-center px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:scale-105">
                Watch Demo
              </button>
            </div>

            {error && (
              <div className="mb-8 p-6 bg-red-900/80 backdrop-blur-sm border border-red-500/50 rounded-lg max-w-lg mx-auto shadow-2xl">
                <div className="flex items-center mb-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <h3 className="text-red-200 font-semibold">Authentication Error</h3>
                </div>
                <p className="text-red-300 text-sm mb-3">
                  {error}
                </p>
                <div className="text-xs text-red-400 space-y-1">
                  <p>• Please check your browser console for detailed error information</p>
                  <p>• Ensure popups are enabled for this site</p>
                  <p>• Try refreshing the page and attempting login again</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-xs text-red-400 underline hover:text-red-200"
                >
                  Refresh Page
                </button>
              </div>
            )}

            {/* Supported Providers */}
            <div className="text-center animate-fade-in-delay-3">
              <p className="text-sm text-gray-300 mb-4 drop-shadow-md">Supports all major AI providers</p>
              <div className="flex flex-wrap justify-center gap-6">
                {providers.map((provider, index) => (
                  <span 
                    key={provider} 
                    className="text-sm font-medium text-gray-300 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {provider}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to manage AI APIs
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Tokerz provides a comprehensive platform to securely manage your AI service integrations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="text-center group">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      /{plan.period}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {loading ? 'Loading...' : plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to secure your AI infrastructure?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of developers who trust Tokerz to manage their AI API keys securely
          </p>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                Start Your Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
          <p className="text-blue-100 text-sm mt-4">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold">Tokerz</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2025 Tokerz. All rights reserved.</p>
            <p className="mt-2">Secure API Key Management Platform</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
