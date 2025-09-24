import React from 'react'
import { getAllProviders, getProvidersByCategory } from '../utils/providerConfig'

const LogoTest: React.FC = () => {
  const allProviders = getAllProviders()
  const imageProviders = getProvidersByCategory('image')
  const audioProviders = getProvidersByCategory('audio')
  const reasoningProviders = getProvidersByCategory('reasoning')
  
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Logo Integration Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Image Generation Providers ({imageProviders.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {imageProviders.map((provider) => (
              <div key={provider.name} className="flex flex-col items-center">
                <img 
                  src={provider.logoUrl} 
                  alt={provider.displayName}
                  className="w-16 h-16 object-contain mb-2"
                  style={{ backgroundColor: 'transparent', background: 'transparent' }}
                  onError={(e) => {
                    console.error(`Failed to load logo: ${provider.logoUrl}`)
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="text-center">
                  <p className="font-medium text-sm text-white">{provider.displayName}</p>
                  <p className="text-xs text-gray-400">{provider.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Audio Providers ({audioProviders.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {audioProviders.map((provider) => (
              <div key={provider.name} className="flex flex-col items-center">
                <img 
                  src={provider.logoUrl} 
                  alt={provider.displayName}
                  className="w-16 h-16 object-contain mb-2"
                  style={{ backgroundColor: 'transparent', background: 'transparent' }}
                  onError={(e) => {
                    console.error(`Failed to load logo: ${provider.logoUrl}`)
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="text-center">
                  <p className="font-medium text-sm text-white">{provider.displayName}</p>
                  <p className="text-xs text-gray-400">{provider.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Reasoning Providers ({reasoningProviders.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {reasoningProviders.slice(0, 8).map((provider) => (
              <div key={provider.name} className="flex flex-col items-center">
                <img 
                  src={provider.logoUrl} 
                  alt={provider.displayName}
                  className="w-16 h-16 object-contain mb-2"
                  style={{ backgroundColor: 'transparent', background: 'transparent' }}
                  onError={(e) => {
                    console.error(`Failed to load logo: ${provider.logoUrl}`)
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="text-center">
                  <p className="font-medium text-sm text-white">{provider.displayName}</p>
                  <p className="text-xs text-gray-400">{provider.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Logo Mapping Summary</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-white"><strong>Total Providers:</strong> {allProviders.length}</p>
            <p className="text-white"><strong>Unique Logo Files Used:</strong> {new Set(allProviders.map(p => p.logoUrl)).size}</p>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-white">Logo Usage Count:</h3>
              {(() => {
                const logoUsage = allProviders.reduce((acc, provider) => {
                  acc[provider.logoUrl] = (acc[provider.logoUrl] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
                
                return Object.entries(logoUsage)
                  .sort(([,a], [,b]) => b - a)
                  .map(([logoUrl, count]) => (
                    <div key={logoUrl} className="text-sm text-gray-300">
                      <code className="text-blue-400">{logoUrl}</code>: {count} provider{count > 1 ? 's' : ''}
                    </div>
                  ))
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogoTest
