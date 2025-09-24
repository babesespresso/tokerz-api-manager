
import React, { useState } from 'react'
import {User} from 'lucide-react'

interface ProfileImageProps {
  user: any
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showFallback?: boolean
}

const ProfileImage: React.FC<ProfileImageProps> = ({ 
  user, 
  size = 'md', 
  className = '', 
  showFallback = true 
}) => {
  const [imageError, setImageError] = useState(false)

  // Size mappings
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6', 
    xl: 'h-8 w-8'
  }

  // Get profile image URL from user data
  const getProfileImageUrl = (): string | null => {
    if (!user) return null
    
    // Debug logging to see what user data we have
    console.log('ProfileImage component - user data:', user)
    console.log('ProfileImage component - specific fields:', {
      profileImage: user.profileImage,
      avatar_url: user.avatar_url,
      display_name: user.display_name,
      userName: user.userName,
      email: user.email,
      id: user.id
    })
    
    const possibleFields = [
      'profileImage', 'avatar_url', 'profile_image', 'avatar', 'picture', 'photo', 
      'image', 'avatarUrl', 'photoURL', 'profilePicture', 'profile_picture',
      'profileImageUrl', 'profile_image_url', 'imageUrl', 'image_url',
      'user_image', 'userImage', 'user_avatar', 'userAvatar'
    ]
    
    for (const field of possibleFields) {
      const value = user[field]
      if (value && typeof value === 'string' && value.trim() !== '') {
        if (value.startsWith('http') || value.startsWith('https') || 
            value.startsWith('data:') || value.startsWith('/')) {
          console.log(`ProfileImage component - found image URL in field '${field}':`, value)
          return value
        }
      }
    }
    
    // Check nested profile objects
    if (user.profile?.image) return user.profile.image
    if (user.user_profile?.image) return user.user_profile.image
    
    console.log('ProfileImage component - no valid image URL found')
    return null
  }

  const profileImageUrl = getProfileImageUrl()
  const showProfileImage = profileImageUrl && !imageError

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

  // Add cache-busting to force image refresh
  const getCacheBustedUrl = (url: string): string => {
    if (!url) return url
    
    // Only add cache-busting for Supabase storage URLs to avoid breaking other image sources
    if (url.includes('.supabase.co/storage/')) {
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}_cb=${Date.now()}`
    }
    
    return url
  }

  const finalImageUrl = profileImageUrl ? getCacheBustedUrl(profileImageUrl) : null

  return (
    <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-600 shadow-sm ${className}`}>
      {finalImageUrl && !imageError ? (
        <img 
          src={finalImageUrl} 
          alt={`${user?.userName || user?.name || 'User'}'s profile`}
          className="h-full w-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
          key={finalImageUrl} // Force re-render when URL changes
        />
      ) : showFallback ? (
        <User className={`${iconSizes[size]} text-white`} />
      ) : null}
    </div>
  )
}

export default ProfileImage
