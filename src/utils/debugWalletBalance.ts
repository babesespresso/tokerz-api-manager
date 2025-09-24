// Debug Wallet Balance Detection
// This file helps debug wallet balance detection issues with real API keys

import { fetchWalletBalance, clearBalanceCache, BALANCE_API_CONFIGS } from './walletBalanceApis'
import { getProviderConfig } from './providerConfig'
import { detectApiKeyProvider } from './providerDetection'
import toast from 'react-hot-toast'

// Debug function to test wallet balance detection
export async function debugWalletBalanceDetection(apiKey: string, nickname?: string) {
  console.log('🐛 DEBUG: Starting wallet balance detection debug...')
  console.log(`🔑 API Key (first 10 chars): ${apiKey.slice(0, 10)}...`)
  
  try {
    // Step 1: Detect the provider
    console.log('\n📋 Step 1: Provider Detection')
    const detection = detectApiKeyProvider(apiKey)
    console.log('Provider detection result:', detection)
    
    if (!detection.provider) {
      console.error('❌ Could not detect provider from API key')
      toast.error('Could not detect provider from API key')
      return {
        success: false,
        error: 'Provider detection failed'
      }
    }
    
    const provider = detection.provider
    console.log(`✅ Detected provider: ${provider}`)
    
    // Step 2: Get provider configuration
    console.log('\n📋 Step 2: Provider Configuration')
    const providerConfig = getProviderConfig(provider)
    console.log('Provider config:', {
      displayName: providerConfig.displayName,
      hasWalletBalance: providerConfig.hasWalletBalance,
      category: providerConfig.category,
      company: providerConfig.company
    })
    
    if (!providerConfig.hasWalletBalance) {
      console.log('⚠️ Provider does not support wallet balance checking')
      toast(`${providerConfig.displayName} does not support wallet balance checking`, {
        icon: '⚠️'
      })
      return {
        success: true,
        provider,
        hasWalletBalance: false,
        message: 'Provider does not support wallet balance'
      }
    }
    
    // Step 3: Check balance API configuration
    console.log('\n📋 Step 3: Balance API Configuration')
    const normalizedProvider = provider.split('-')[0] || provider
    const balanceConfig = BALANCE_API_CONFIGS[normalizedProvider]
    
    if (!balanceConfig) {
      console.error('❌ No balance API configuration found')
      toast.error('No balance API configuration found for this provider')
      return {
        success: false,
        error: 'No balance API configuration'
      }
    }
    
    console.log('Balance API config:', {
      endpoint: balanceConfig.endpoint,
      hasRateLimit: !!balanceConfig.rateLimit,
      rateLimit: balanceConfig.rateLimit
    })
    
    // Step 4: Clear cache and test balance fetch
    console.log('\n📋 Step 4: Testing Balance Fetch')
    clearBalanceCache() // Clear cache for fresh test
    
    console.log('🌐 Making fresh balance API request...')
    const balanceResult = await fetchWalletBalance(provider, apiKey, { 
      skipCache: true, 
      timeout: 15000 
    })
    
    console.log('Balance fetch result:', balanceResult)
    
    // Step 5: Display results
    console.log('\n📋 Step 5: Final Results')
    
    if (balanceResult.error) {
      console.error('❌ Balance fetch failed:', balanceResult.error)
      toast.error(`Balance fetch failed: ${balanceResult.error}`)
      
      return {
        success: false,
        provider,
        hasWalletBalance: true,
        error: balanceResult.error,
        balanceResult
      }
    } else {
      console.log(`✅ Balance fetched successfully: ${balanceResult.currency} ${balanceResult.balance}`)
      toast.success(`${providerConfig.displayName}: ${balanceResult.currency} ${balanceResult.balance}`)
      
      return {
        success: true,
        provider,
        hasWalletBalance: true,
        balance: balanceResult.balance,
        currency: balanceResult.currency,
        balanceResult,
        nickname
      }
    }
    
  } catch (error) {
    console.error('💥 Debug function crashed:', error)
    toast.error('Debug function crashed - check console for details')
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Quick test with multiple API keys
export async function debugMultipleApiKeys(apiKeys: Array<{ key: string; nickname?: string }>) {
  console.log(`🐛 DEBUG: Testing ${apiKeys.length} API keys...`)
  
  const results = []
  
  for (const [index, { key, nickname }] of apiKeys.entries()) {
    console.log(`\n🔍 Testing API key ${index + 1}/${apiKeys.length}: ${nickname || 'Unnamed'}`)
    
    const result = await debugWalletBalanceDetection(key, nickname)
    results.push({
      index: index + 1,
      nickname: nickname || 'Unnamed',
      ...result
    })
    
    // Small delay between tests
    if (index < apiKeys.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Summary
  console.log('\n📊 SUMMARY:')
  const successful = results.filter(r => r.success && r.hasWalletBalance)
  const failed = results.filter(r => !r.success)
  const unsupported = results.filter(r => r.success && !r.hasWalletBalance)
  
  console.log(`✅ Successful balance fetches: ${successful.length}`)
  console.log(`❌ Failed balance fetches: ${failed.length}`)
  console.log(`⚠️ Unsupported providers: ${unsupported.length}`)
  
  if (successful.length > 0) {
    console.log('\n✅ Successful balances:')
    successful.forEach(result => {
      console.log(`  - ${result.nickname}: ${result.currency} ${result.balance}`)
    })
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed balances:')
    failed.forEach(result => {
      console.log(`  - ${result.nickname}: ${result.error}`)
    })
  }
  
  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    unsupported: unsupported.length,
    results
  }
}

// Test with providers that should support wallet balance
export async function debugSupportedProviders() {
  console.log('🐛 DEBUG: Testing all supported providers...')
  
  const supportedProviders = ['deepseek', 'thudm', 'zai']
  
  for (const provider of supportedProviders) {
    console.log(`\n🔍 Testing ${provider} configuration...`)
    
    const config = BALANCE_API_CONFIGS[provider]
    if (!config) {
      console.log(`❌ No configuration found for ${provider}`)
      continue
    }
    
    console.log(`✅ Configuration found for ${provider}:`)
    console.log(`  - Endpoint: ${config.endpoint}`)
    console.log(`  - Rate limit: ${config.rateLimit ? 'Yes' : 'No'}`)
    
    // Test with a dummy API key to see the error
    try {
      const testResult = await fetchWalletBalance(provider, `dummy-key-${provider}`, { timeout: 5000 })
      console.log(`  - Test result:`, testResult.error || 'Success')
    } catch (error) {
      console.log(`  - Test error:`, error)
    }
  }
}

// Export function to easily test from browser console
if (typeof window !== 'undefined') {
  (window as any).debugWalletBalance = debugWalletBalanceDetection;
  (window as any).debugMultipleApiKeys = debugMultipleApiKeys;
  (window as any).debugSupportedProviders = debugSupportedProviders;

  console.log('🐛 DEBUG: Wallet balance debug functions loaded');
  console.log('  - debugWalletBalance(apiKey, nickname?) - Test single API key');
  console.log('  - debugMultipleApiKeys([{key, nickname}]) - Test multiple API keys');  
  console.log('  - debugSupportedProviders() - Test provider configurations');
}
