
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ApiKeys from './pages/ApiKeys'
import Usage from './pages/Usage'
import Subscription from './pages/Subscription'
import TokenStore from './pages/TokenStore'
import ApiTester from './pages/ApiTester'
import Settings from './pages/Settings'
import AdminDashboard from './pages/AdminDashboard'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'

function App() {
  const { isAuthenticated, user, loading } = useAuth()
  const { theme } = useTheme()

  // Show loading spinner while authentication is being determined
  if (loading) {
    return (
      <div className={theme}>
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={theme}>
      <div className="min-h-screen transition-colors bg-black">
        <Router>
          <Routes>
            {/* Public route - Landing page */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Landing />
                )
              } 
            />
            
            {/* Protected routes - Authenticated users only */}
            <Route 
              path="/*" 
              element={
                isAuthenticated ? (
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/api-keys" element={<ApiKeys />} />
                      <Route path="/usage" element={<Usage />} />
                      <Route path="/subscription" element={<Subscription />} />
                      <Route path="/token-store" element={<TokenStore />} />
                      <Route path="/api-tester" element={<ApiTester />} />
                      <Route path="/settings" element={<Settings />} />
                      {user?.userRole === 'ADMIN' && (
                        <Route path="/admin" element={<AdminDashboard />} />
                      )}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#000000',
            },
          }}
        />
      </div>
    </div>
  )
}

export default App
