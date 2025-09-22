
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
    
    const possibleFields = [
      'profileImage', 'profile_image', 'avatar', 'picture', 'photo', 
      'image', 'avatarUrl', 'photoURL', 'profilePicture', 'profile_picture',
      'profileImageUrl', 'profile_image_url', 'imageUrl', 'image_url',
      'user_image', 'userImage', 'user_avatar', 'userAvatar'
    ]
    
    for (const field of possibleFields) {
      const value = user[field]
      if (value && typeof value === 'string' && value.trim() !== '') {
        if (value.startsWith('http') || value.startsWith('https') || 
            value.startsWith('data:') || value.startsWith('/')) {
          return value
        }
      }
    }
    
    // Check nested profile objects
    if (user.profile?.image) return user.profile.image
    if (user.user_profile?.image) return user.user_profile.image
    
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

  return (
    <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-600 shadow-sm ${className}`}>
      {showProfileImage ? (
        <img 
          src={profileImageUrl} 
          alt={`${user?.userName || user?.name || 'User'}'s profile`}
          className="h-full w-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
        />
      ) : showFallback ? (
        <User className={`${iconSizes[size]} text-white`} />
      ) : null}
    </div>
  )
}

export default ProfileImage
