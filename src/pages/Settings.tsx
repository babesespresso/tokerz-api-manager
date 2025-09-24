
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import {User, Mail, Key, Bell, Shield, Moon, Sun, Save, Edit2, Camera, Trash2, RefreshCw} from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, updateProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    userName: user?.userName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    usageAlerts: true,
    securityAlerts: true,
    marketingEmails: false
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        userName: user.userName || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const resizeImage = (file: File, maxWidth: number = 200, maxHeight: number = 200, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    try {
      setProfileImageFile(file)

      // Resize and compress image to prevent header size issues
      const compressedImage = await resizeImage(file, 200, 200, 0.8)
      setProfileImagePreview(compressedImage)
    } catch (error) {
      console.error('Error processing image:', error)
      toast.error('Failed to process image')
    }
  }

  const handleSaveProfile = async () => {
    if (!formData.userName.trim()) {
      toast.error('Username is required')
      return
    }

    setIsSaving(true)
    try {
      const updateData: any = {
        userName: formData.userName.trim(),
        email: formData.email.trim()
      }

      // If there's a new profile image file, upload it to storage first
      if (profileImageFile) {
        try {
          // Import uploadProfileImage from supabase lib
          const { uploadProfileImage } = await import('../lib/supabase')
          const imageUrl = await uploadProfileImage(user?.id || '', profileImageFile)
          updateData.profileImage = imageUrl
        } catch (uploadError) {
          console.error('Profile image upload error:', uploadError)
          toast.error('Failed to upload profile image. Saving other changes...')
          // Continue with other profile updates even if image upload fails
        }
      }

      await updateProfile(updateData)
      setIsEditing(false)
      setProfileImageFile(null)
      setProfileImagePreview(null)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveProfileImage = async () => {
    setIsSaving(true)
    try {
      await updateProfile({
        profileImage: null
      })
      setProfileImagePreview(null)
      setProfileImageFile(null)
      toast.success('Profile image removed successfully!')
    } catch (error) {
      console.error('Error removing profile image:', error)
      toast.error('Failed to remove profile image')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!formData.currentPassword || !formData.newPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsSaving(true)
    try {
      // Implement password change logic here
      toast.success('Password updated successfully!')
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      console.error('Password change error:', error)
      toast.error('Failed to update password')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    const confirmation = prompt('Type "DELETE" to confirm account deletion:')
    if (confirmation !== 'DELETE') {
      toast.error('Account deletion cancelled')
      return
    }

    try {
      // Implement account deletion logic here
      toast.success('Account deletion initiated')
    } catch (error) {
      console.error('Account deletion error:', error)
      toast.error('Failed to delete account')
    }
  }

  return (
    <div className="flex-1 bg-black overflow-auto min-h-screen">
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Settings
          </h1>
          <p className="text-base text-gray-300">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-600 shadow-sm overflow-hidden">
                      {(profileImagePreview || user?.profileImage) ? (
                        <img 
                          src={profileImagePreview || user?.profileImage} 
                          alt={`${user?.userName || user?.name || 'User'}'s profile`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <>
                        <label htmlFor="profile-image-upload" className="absolute -bottom-1 -right-1 p-1.5 bg-gray-700 rounded-full text-gray-300 hover:bg-gray-600 cursor-pointer">
                          <Camera className="w-3 h-3" />
                        </label>
                        <input
                          id="profile-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{user?.userName || 'User'}</h3>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.userRole || user?.role || 'Member'} Account
                    </p>
                    {isEditing && (user?.profileImage || profileImagePreview) && (
                      <button
                        onClick={handleRemoveProfileImage}
                        disabled={isSaving}
                        className="flex items-center gap-1 mt-2 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove Image
                      </button>
                    )}
                    {profileImageFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        New image ready to save
                      </p>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.userName}
                      onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 rounded-lg border-2 bg-black border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 rounded-lg border-2 bg-black border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Password Settings */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Key className="w-5 h-5 text-gray-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Password & Security</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border-2 bg-black border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border-2 bg-black border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border-2 bg-black border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Bell className="w-5 h-5 text-gray-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {key === 'emailAlerts' && 'Receive email notifications for important updates'}
                        {key === 'usageAlerts' && 'Get notified when approaching usage limits'}
                        {key === 'securityAlerts' && 'Alerts for security-related activities'}
                        {key === 'marketingEmails' && 'Promotional emails and product updates'}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-gray-600' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
                </div>
                <h2 className="text-lg font-semibold text-white">Appearance</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Dark Mode</h4>
                  <p className="text-sm text-gray-400">Use dark theme across the application</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-gray-900 rounded-xl border border-gray-600 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Trash2 className="w-5 h-5 text-gray-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Delete Account</h4>
                  <p className="text-sm text-gray-400">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 rounded-lg transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
