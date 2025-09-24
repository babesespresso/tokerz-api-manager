/**
 * Storage Manager - Handles browser storage cleanup to prevent 431 errors
 * 
 * The 431 "Request Header Fields Too Large" error occurs when accumulated
 * browser storage (localStorage, sessionStorage, cookies) makes HTTP headers
 * exceed server limits. This utility prevents that by managing storage size.
 */

interface StorageItem {
  key: string
  size: number
  lastAccessed: number
}

class StorageManager {
  private readonly MAX_STORAGE_SIZE = 2 * 1024 * 1024 // 2MB limit
  private readonly CLEANUP_THRESHOLD = 0.8 // Clean when 80% full
  private readonly SUPABASE_KEYS = [
    'supabase.auth.token',
    'sb-auth-token',
    'sb-refresh-token',
    'supabase-auth-token'
  ]

  /**
   * Calculate total storage size in bytes
   */
  private getStorageSize(storage: Storage): number {
    let total = 0
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key) {
        const value = storage.getItem(key) || ''
        total += key.length + value.length
      }
    }
    return total * 2 // UTF-16 encoding uses 2 bytes per character
  }

  /**
   * Get storage items sorted by last access time
   */
  private getStorageItems(storage: Storage): StorageItem[] {
    const items: StorageItem[] = []
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key) {
        const value = storage.getItem(key) || ''
        const size = (key.length + value.length) * 2
        
        // Try to get last accessed time from item metadata
        let lastAccessed = Date.now()
        try {
          const parsed = JSON.parse(value)
          if (parsed && parsed.lastAccessed) {
            lastAccessed = parsed.lastAccessed
          } else if (parsed && parsed.expires_at) {
            lastAccessed = parsed.expires_at * 1000
          }
        } catch {
          // Use current time if parsing fails
        }
        
        items.push({ key, size, lastAccessed })
      }
    }
    
    return items.sort((a, b) => a.lastAccessed - b.lastAccessed)
  }

  /**
   * Clean up old storage items to free space
   */
  private cleanupStorage(storage: Storage, targetReduction: number) {
    const items = this.getStorageItems(storage)
    let removedSize = 0
    
    for (const item of items) {
      // Don't remove critical Supabase auth tokens
      if (this.SUPABASE_KEYS.some(key => item.key.includes(key))) {
        continue
      }
      
      // Don't remove recently accessed items (less than 1 hour old)
      if (Date.now() - item.lastAccessed < 3600000) {
        continue
      }
      
      try {
        storage.removeItem(item.key)
        removedSize += item.size
        
        console.log(`[StorageManager] Removed ${item.key} (${item.size} bytes)`)
        
        if (removedSize >= targetReduction) {
          break
        }
      } catch (error) {
        console.warn(`[StorageManager] Failed to remove ${item.key}:`, error)
      }
    }
    
    return removedSize
  }

  /**
   * Check and clean storage if needed
   */
  checkAndCleanStorage() {
    const storages = [
      { name: 'localStorage', storage: localStorage },
      { name: 'sessionStorage', storage: sessionStorage }
    ]
    
    for (const { name, storage } of storages) {
      try {
        const currentSize = this.getStorageSize(storage)
        const usageRatio = currentSize / this.MAX_STORAGE_SIZE
        
        console.log(`[StorageManager] ${name} usage: ${(currentSize / 1024).toFixed(1)}KB (${(usageRatio * 100).toFixed(1)}%)`)
        
        if (usageRatio > this.CLEANUP_THRESHOLD) {
          console.warn(`[StorageManager] ${name} usage exceeds threshold, cleaning up...`)
          
          const targetReduction = currentSize - (this.MAX_STORAGE_SIZE * 0.5) // Clean to 50%
          const removedSize = this.cleanupStorage(storage, targetReduction)
          
          console.log(`[StorageManager] Cleaned ${(removedSize / 1024).toFixed(1)}KB from ${name}`)
        }
      } catch (error) {
        console.error(`[StorageManager] Error managing ${name}:`, error)
      }
    }
  }

  /**
   * Emergency cleanup - removes everything except critical auth data
   */
  emergencyCleanup() {
    console.warn('[StorageManager] Performing emergency storage cleanup')
    
    const storages = [localStorage, sessionStorage]
    
    for (const storage of storages) {
      try {
        // Backup critical Supabase auth data
        const authBackup: Record<string, string> = {}
        
        this.SUPABASE_KEYS.forEach(key => {
          for (let i = 0; i < storage.length; i++) {
            const storageKey = storage.key(i)
            if (storageKey && storageKey.includes(key)) {
              const value = storage.getItem(storageKey)
              if (value) {
                authBackup[storageKey] = value
              }
            }
          }
        })
        
        // Clear all storage
        storage.clear()
        
        // Restore critical auth data
        Object.entries(authBackup).forEach(([key, value]) => {
          try {
            storage.setItem(key, value)
          } catch (error) {
            console.error(`[StorageManager] Failed to restore ${key}:`, error)
          }
        })
        
        console.log('[StorageManager] Emergency cleanup completed, auth data preserved')
      } catch (error) {
        console.error('[StorageManager] Emergency cleanup failed:', error)
      }
    }
  }

  /**
   * Clear all browser storage (for manual reset)
   */
  clearAllStorage() {
    try {
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear cookies for current domain
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      })
      
      console.log('[StorageManager] All storage cleared')
    } catch (error) {
      console.error('[StorageManager] Failed to clear all storage:', error)
    }
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats() {
    const stats = {
      localStorage: {
        size: this.getStorageSize(localStorage),
        itemCount: localStorage.length
      },
      sessionStorage: {
        size: this.getStorageSize(sessionStorage),
        itemCount: sessionStorage.length
      }
    }
    
    return {
      ...stats,
      total: stats.localStorage.size + stats.sessionStorage.size,
      totalItems: stats.localStorage.itemCount + stats.sessionStorage.itemCount
    }
  }
}

// Create singleton instance
export const storageManager = new StorageManager()

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  // Check storage on load
  storageManager.checkAndCleanStorage()
  
  // Periodic cleanup every 10 minutes
  setInterval(() => {
    storageManager.checkAndCleanStorage()
  }, 10 * 60 * 1000)
  
  // Cleanup before page unload
  window.addEventListener('beforeunload', () => {
    storageManager.checkAndCleanStorage()
  })
}

// Export utility functions
export const clearBrowserStorage = () => storageManager.clearAllStorage()
export const getStorageStats = () => storageManager.getStorageStats()
export const emergencyStorageCleanup = () => storageManager.emergencyCleanup()
