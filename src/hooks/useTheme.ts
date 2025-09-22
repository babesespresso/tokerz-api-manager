
import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as Theme) || 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = window.document.documentElement
    
    const updateTheme = () => {
      let effectiveTheme: 'light' | 'dark'
      
      if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      } else {
        effectiveTheme = theme
      }
      
      setResolvedTheme(effectiveTheme)
      
      // Remove previous theme classes
      root.classList.remove('light', 'dark')
      // Add current theme class
      root.classList.add(effectiveTheme)
      
      // Set CSS custom properties for consistent theming
      if (effectiveTheme === 'dark') {
        root.style.setProperty('--bg-primary', '#000000')
        root.style.setProperty('--bg-secondary', '#111111')
        root.style.setProperty('--bg-tertiary', '#1a1a1a')
        root.style.setProperty('--text-primary', '#ffffff')
        root.style.setProperty('--text-secondary', '#cccccc')
        root.style.setProperty('--border-color', '#333333')
        document.body.className = 'dark bg-black text-white'
      } else {
        root.style.setProperty('--bg-primary', '#ffffff')
        root.style.setProperty('--bg-secondary', '#f8fafc')
        root.style.setProperty('--bg-tertiary', '#f1f5f9')
        root.style.setProperty('--text-primary', '#0f172a')
        root.style.setProperty('--text-secondary', '#64748b')
        root.style.setProperty('--border-color', '#e2e8f0')
        document.body.className = 'bg-white text-gray-900'
      }
    }

    updateTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setThemeAndSave = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme)
    setTheme(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setThemeAndSave(newTheme)
  }

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeAndSave,
    toggleTheme
  }
}
