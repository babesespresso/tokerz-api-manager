// Test Wallet Balance Functionality
// This is a demonstration of the wallet balance checking system

import { fetchWalletBalance, fetchMultipleWalletBalances } from './walletBalanceApis'
import toast from 'react-hot-toast'

// Test API keys for different providers (these are fake keys for testing)
const TEST_API_KEYS = {
  deepseek: 'sk-deepseek-test-key-1234567890abcdef',
  thudm: 'glm-thudm-test-key-1234567890abcdef',
  zai: 'zai-test-key-1234567890abcdef',
  openai: 'sk-openai-test-key-1234567890abcdef', // Should show no balance support
  claude: 'sk-ant-claude-test-key-1234567890abcdef' // Should show no balance support
}

export async function testWalletBalanceFeature() {
  console.log('🧪 Testing Wallet Balance Feature...')
  
  try {
    // Test 1: Check individual wallet balances
    console.log('\n📋 Test 1: Individual Balance Checks')
    
    for (const [provider, apiKey] of Object.entries(TEST_API_KEYS)) {
      console.log(`\n🔍 Testing ${provider.toUpperCase()}...`)
      
      const result = await fetchWalletBalance(provider, apiKey)
      
      console.log(`  Balance: ${result.currency} ${result.balance}`)
      if (result.error) {
        console.log(`  Error: ${result.error}`)
      }
      if (result.lastUpdated) {
        console.log(`  Last Updated: ${result.lastUpdated}`)
      }
    }
    
    // Test 2: Batch balance checking
    console.log('\n📋 Test 2: Batch Balance Checks')
    
    const batchApiKeys = Object.entries(TEST_API_KEYS).map(([provider, apiKey], index) => ({
      id: `test-key-${index}`,
      provider,
      apiKey
    }))
    
    console.log(`\n🔍 Testing ${batchApiKeys.length} keys simultaneously...`)
    const batchResults = await fetchMultipleWalletBalances(batchApiKeys)
    
    Object.entries(batchResults).forEach(([keyId, result]) => {
      const keyInfo = batchApiKeys.find(k => k.id === keyId)
      console.log(`  ${keyInfo?.provider}: ${result.currency} ${result.balance}${result.error ? ` (${result.error})` : ''}`)
    })
    
    // Test 3: Error handling
    console.log('\n📋 Test 3: Error Handling')
    
    const invalidResult = await fetchWalletBalance('invalid-provider', 'invalid-key')
    console.log(`  Invalid provider result: ${invalidResult.error}`)
    
    console.log('\n✅ Wallet Balance Feature Tests Complete!')
    toast.success('Wallet balance tests completed - check console for results')
    
    return {
      success: true,
      individualTests: Object.keys(TEST_API_KEYS).length,
      batchTest: batchApiKeys.length,
      results: batchResults
    }
    
  } catch (error) {
    console.error('❌ Wallet balance test failed:', error)
    toast.error('Wallet balance test failed - check console for details')
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test specific provider balance checking
export async function testProviderBalance(provider: string, apiKey: string) {
  console.log(`🧪 Testing ${provider} wallet balance...`)
  
  try {
    const result = await fetchWalletBalance(provider, apiKey, { skipCache: true })
    
    console.log('Result:', {
      provider,
      balance: result.balance,
      currency: result.currency,
      error: result.error,
      lastUpdated: result.lastUpdated
    })
    
    if (result.error) {
      toast.error(`${provider}: ${result.error}`)
    } else {
      toast.success(`${provider}: ${result.currency} ${result.balance}`)
    }
    
    return result
  } catch (error) {
    console.error(`Failed to test ${provider}:`, error)
    toast.error(`Failed to test ${provider} balance`)
    return null
  }
}

// Simulate wallet balance changes for testing
export function simulateWalletBalanceUpdate(provider: string, newBalance: number) {
  console.log(`🎭 Simulating ${provider} balance update to ${newBalance}`)
  
  // This would normally update your local cache or trigger a refresh
  toast(`Simulated ${provider} balance: $${newBalance.toFixed(2)}`, {
    icon: 'ℹ️',
    duration: 3000
  })
  
  return {
    provider,
    balance: newBalance,
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
    simulated: true
  }
}

// Helper to test all supported providers
export async function testSupportedProvidersOnly() {
  console.log('🧪 Testing only providers with wallet balance support...')
  
  const supportedProviders = {
    deepseek: TEST_API_KEYS.deepseek,
    thudm: TEST_API_KEYS.thudm,
    zai: TEST_API_KEYS.zai
  }
  
  const results: Record<string, any> = {}
  
  for (const [provider, apiKey] of Object.entries(supportedProviders)) {
    const result = await fetchWalletBalance(provider, apiKey)
    results[provider] = result
    
    console.log(`${provider}: ${result.error || `${result.currency} ${result.balance}`}`)
  }
  
  return results
}

// Demonstration function to show in UI
export function createWalletBalanceDemo() {
  return {
    title: 'Wallet Balance Feature Demo',
    description: 'This demonstrates wallet balance checking for API providers that support it.',
    supportedProviders: ['DeepSeek', 'THUDM (GLM)', 'Z.ai'],
    features: [
      '✅ Real-time balance checking',
      '✅ Multiple provider support',  
      '✅ Error handling for unsupported providers',
      '✅ Caching to avoid rate limits',
      '✅ Batch balance fetching',
      '✅ Loading states and error messages'
    ],
    usage: [
      '1. Add an API key from a supported provider',
      '2. The system automatically checks wallet balance',
      '3. Balance is displayed in the API key card',
      '4. Click refresh button to update balance',
      '5. Expand card details for more balance info'
    ]
  }
}
