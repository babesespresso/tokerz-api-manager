import { PROVIDER_CONFIGS, ProviderConfig } from './providerConfig'

interface DetectionResult {
  provider: string | null
  confidence: number
  matchedPattern: string | null
  suggestions: string[]
}

/**
 * Detects the API provider based on the API key format
 */
export function detectApiKeyProvider(apiKey: string): DetectionResult {
  if (!apiKey || typeof apiKey !== 'string') {
    return {
      provider: null,
      confidence: 0,
      matchedPattern: null,
      suggestions: []
    }
  }

  const trimmedKey = apiKey.trim()
  const providers = Object.values(PROVIDER_CONFIGS)
  const matches: Array<{ provider: string; confidence: number; pattern: string }> = []

  // Define detection patterns for each provider
  const detectionPatterns = [
    // Anthropic Claude - starts with 'sk-ant-' (check this first to avoid sk- overlap)
    {
      pattern: /^sk-ant-[a-zA-Z0-9_-]{20,}$/,
      providers: ['claude-3-5-sonnet', 'claude-3-haiku', 'claude'],
      confidence: 0.98
    },
    // DeepSeek - check these before OpenAI to avoid false matches
    // DeepSeek keys are 32 hex chars after 'sk-' (common format)
    {
      pattern: /^sk-[a-f0-9]{32}$/,
      providers: ['deepseek-r1', 'deepseek-v3', 'deepseek'],
      confidence: 0.96
    },
    // DeepSeek alternative - 48 hex chars after sk- (longer format)
    {
      pattern: /^sk-[a-f0-9]{48}$/,
      providers: ['deepseek-r1', 'deepseek-v3', 'deepseek'],
      confidence: 0.95
    },
    // DeepSeek mixed alphanumeric - 32-64 chars
    {
      pattern: /^sk-[a-zA-Z0-9]{32,64}$/,
      providers: ['deepseek-r1', 'deepseek-v3', 'deepseek'],
      confidence: 0.85
    },
    // OpenAI - starts with 'sk-' but exclude ant- and common DeepSeek patterns
    // OpenAI keys are typically shorter (20-40 chars after sk-)
    {
      pattern: /^sk-(?!ant)[a-zA-Z0-9]{20,47}$/,
      providers: ['openai-gpt4o', 'openai-gpt41', 'openai-gpt41-mini', 'openai-gpt41-nano', 'openai-o3', 'openai-o4-mini', 'openai-o4-mini-high', 'dall-e-3', 'openai-whisper', 'openai'],
      confidence: 0.92
    },
    // Google - starts with 'AIza'
    {
      pattern: /^AIza[a-zA-Z0-9_-]{35,}$/,
      providers: ['gemini-2-flash-exp', 'gemini-1-5-pro', 'gemini'],
      confidence: 0.95
    },
    // THUDM GLM - starts with 'glm-'
    {
      pattern: /^glm-[a-zA-Z0-9]{20,}$/,
      providers: ['thudm-glm-z1-32b', 'thudm-glm-4-plus', 'thudm-glm-4-5', 'thudm'],
      confidence: 0.98
    },
    // Z.ai - starts with 'zai-'
    {
      pattern: /^zai-[a-zA-Z0-9]{20,}$/,
      providers: ['zai-glm-4-5', 'zai'],
      confidence: 0.98
    },
    // TNG Technology - starts with 'tng-'
    {
      pattern: /^tng-[a-zA-Z0-9]{20,}$/,
      providers: ['tng-deepseek-r1t-chimera'],
      confidence: 0.98
    },
    // Microsoft - starts with 'ms-'
    {
      pattern: /^ms-[a-zA-Z0-9]{20,}$/,
      providers: ['microsoft-mai-ds-r1'],
      confidence: 0.98
    },
    // Qwen - starts with 'qwen-'
    {
      pattern: /^qwen-[a-zA-Z0-9]{20,}$/,
      providers: ['qwen-qwen3-235b-a22b'],
      confidence: 0.98
    },
    // Shisa AI - starts with 'shisa-'
    {
      pattern: /^shisa-[a-zA-Z0-9]{20,}$/,
      providers: ['shisa-v2-llama-33-70b'],
      confidence: 0.98
    },
    // Ideogram - starts with 'ideo_'
    {
      pattern: /^ideo_[a-zA-Z0-9]{20,}$/,
      providers: ['ideogram-v2'],
      confidence: 0.98
    },
    // Midjourney - starts with 'mj-'
    {
      pattern: /^mj-[a-zA-Z0-9]{20,}$/,
      providers: ['midjourney-v6'],
      confidence: 0.98
    },
    // Stable Diffusion - starts with 'sd-'
    {
      pattern: /^sd-[a-zA-Z0-9]{20,}$/,
      providers: ['stable-diffusion-3'],
      confidence: 0.98
    },
    // GitHub - starts with 'ghp_'
    {
      pattern: /^ghp_[a-zA-Z0-9]{36}$/,
      providers: ['github-copilot'],
      confidence: 0.98
    },
    // Cursor - starts with 'cur-'
    {
      pattern: /^cur-[a-zA-Z0-9]{20,}$/,
      providers: ['cursor-ai'],
      confidence: 0.98
    },
    // Codeium - starts with 'codeium-'
    {
      pattern: /^codeium-[a-zA-Z0-9]{20,}$/,
      providers: ['codeium'],
      confidence: 0.98
    },
    // ElevenLabs - often starts with 'sk-' but has different structure
    {
      pattern: /^[a-f0-9]{32}$/,
      providers: ['elevenlabs-v2'],
      confidence: 0.70
    }
  ]

  // Check each pattern
  for (const patternInfo of detectionPatterns) {
    if (patternInfo.pattern.test(trimmedKey)) {
      for (const providerKey of patternInfo.providers) {
        // Prefer specific models over generic ones
        const isGeneric = ['openai', 'claude', 'gemini', 'deepseek', 'thudm', 'zai'].includes(providerKey)
        const adjustedConfidence = isGeneric ? patternInfo.confidence * 0.8 : patternInfo.confidence
        
        matches.push({
          provider: providerKey,
          confidence: adjustedConfidence,
          pattern: patternInfo.pattern.source
        })
      }
    }
  }

  // Additional heuristic checks for ambiguous cases
  if (matches.length > 0) {
    // For sk- prefixed keys, try to distinguish between OpenAI and DeepSeek
    if (trimmedKey.startsWith('sk-')) {
      // DeepSeek keys are often 48 hex characters after 'sk-'
      if (/^sk-[a-f0-9]{48}$/.test(trimmedKey)) {
        matches.forEach(match => {
          if (match.provider.includes('deepseek')) {
            match.confidence = Math.min(0.95, match.confidence + 0.2)
          } else if (match.provider.includes('openai')) {
            match.confidence = Math.max(0.3, match.confidence - 0.3)
          }
        })
      }
      // OpenAI keys typically have mixed case and special characters
      else if (/^sk-[a-zA-Z0-9]{20,}$/.test(trimmedKey) && /[A-Z]/.test(trimmedKey)) {
        matches.forEach(match => {
          if (match.provider.includes('openai')) {
            match.confidence = Math.min(0.95, match.confidence + 0.1)
          }
        })
      }
    }
  }

  // Sort matches by confidence and recency of provider
  matches.sort((a, b) => {
    // First sort by confidence
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence
    }
    
    // Then prefer newer models (those with version numbers or specific names)
    const aIsSpecific = !['openai', 'claude', 'gemini', 'deepseek', 'thudm', 'zai'].includes(a.provider)
    const bIsSpecific = !['openai', 'claude', 'gemini', 'deepseek', 'thudm', 'zai'].includes(b.provider)
    
    if (aIsSpecific && !bIsSpecific) return -1
    if (!aIsSpecific && bIsSpecific) return 1
    
    return a.provider.localeCompare(b.provider)
  })

  const bestMatch = matches[0]
  const suggestions = matches.slice(0, 3).map(m => m.provider)

  return {
    provider: bestMatch?.provider || null,
    confidence: bestMatch?.confidence || 0,
    matchedPattern: bestMatch?.pattern || null,
    suggestions: [...new Set(suggestions)] // Remove duplicates
  }
}

/**
 * Gets a human-readable explanation of the detection result
 */
export function getDetectionExplanation(apiKey: string, result: DetectionResult): string {
  if (!result.provider) {
    return "Could not determine provider from API key format. Please verify the key is correct."
  }

  const config = PROVIDER_CONFIGS[result.provider]
  if (!config) {
    return "Detected an unknown provider."
  }

  const confidenceText = result.confidence >= 0.9 ? "High confidence" :
                        result.confidence >= 0.7 ? "Medium confidence" :
                        "Low confidence"

  return `${confidenceText}: Detected ${config.displayName} (${config.company}) based on key format "${config.apiKeyFormat}"`
}

/**
 * Validates if an API key format is generally valid (basic structure check)
 */
export function validateApiKeyFormat(apiKey: string): { isValid: boolean; error?: string } {
  if (!apiKey || typeof apiKey !== 'string') {
    return { isValid: false, error: "API key is required" }
  }

  const trimmedKey = apiKey.trim()
  
  if (trimmedKey.length < 10) {
    return { isValid: false, error: "API key appears too short" }
  }

  if (trimmedKey.length > 200) {
    return { isValid: false, error: "API key appears too long" }
  }

  // Check for obvious placeholder text
  const placeholders = ['your-api-key', 'api-key-here', 'enter-key', 'placeholder', 'example']
  if (placeholders.some(placeholder => trimmedKey.toLowerCase().includes(placeholder))) {
    return { isValid: false, error: "Please enter your actual API key" }
  }

  // Check for suspicious patterns
  if (/^[.]{3,}$/.test(trimmedKey) || /^\*{3,}$/.test(trimmedKey)) {
    return { isValid: false, error: "Please enter your actual API key, not placeholder text" }
  }

  return { isValid: true }
}
