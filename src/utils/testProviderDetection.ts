import { detectApiKeyProvider, getDetectionExplanation, validateApiKeyFormat } from './providerDetection'

// Test cases for different providers
const testCases = [
  // OpenAI - shorter keys with mixed case
  { key: 'sk-1234567890AbCdEfGhIjKlMnOpQrStUv123456', expected: 'openai' },
  { key: 'sk-AbC123XyZ456DefGhi789', expected: 'openai' },
  
  // Claude
  { key: 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz1234567890', expected: 'claude' },
  
  // Google
  { key: 'AIzaSyABC123DEF456GHI789JKL012MNO345PQR678STU', expected: 'gemini' },
  
  // DeepSeek - exactly 48 hex chars after sk-
  { key: 'sk-abcdef1234567890abcdef1234567890abcdef123456', expected: 'deepseek' },
  { key: 'sk-' + 'a'.repeat(48), expected: 'deepseek' },
  { key: 'sk-' + '1234567890abcdef'.repeat(3), expected: 'deepseek' },
  
  // THUDM
  { key: 'glm-abcdef1234567890123456789012345678901234', expected: 'thudm' },
  
  // Edge case - this should be OpenAI (too short for DeepSeek)
  { key: 'sk-1234567890abcdef1234567890abc', expected: 'openai' },
  
  // Invalid cases
  { key: 'invalid-key', expected: null },
  { key: 'sk-', expected: null },
  { key: '', expected: null }
]

export function runDetectionTests() {
  console.log('🧪 Running Provider Detection Tests...')
  
  let passed = 0
  let total = testCases.length
  
  testCases.forEach((testCase, index) => {
    const result = detectApiKeyProvider(testCase.key)
    const validation = validateApiKeyFormat(testCase.key)
    
    console.log(`\n--- Test ${index + 1} ---`)
    console.log(`Key: ${testCase.key.substring(0, 20)}...`)
    console.log(`Expected: ${testCase.expected}`)
    console.log(`Detected: ${result.provider}`)
    console.log(`Confidence: ${result.confidence}`)
    console.log(`Valid Format: ${validation.isValid}`)
    
    if (result.provider && testCase.expected) {
      const explanation = getDetectionExplanation(testCase.key, result)
      console.log(`Explanation: ${explanation}`)
    }
    
    // Check if detection matches expectation
    const providerMatches = testCase.expected === null ? 
      result.provider === null : 
      result.provider?.includes(testCase.expected)
    
    if (providerMatches) {
      console.log('✅ PASS')
      passed++
    } else {
      console.log('❌ FAIL')
    }
  })
  
  console.log(`\n🎯 Test Results: ${passed}/${total} passed (${((passed/total) * 100).toFixed(1)}%)`)
  
  return { passed, total }
}
