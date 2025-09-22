
export interface ProviderConfig {
  name: string
  displayName: string
  usageMetric: 'tokens' | 'requests' | 'characters' | 'images' | 'audio_seconds'
  usageUnit: string
  category: 'text' | 'image' | 'audio' | 'code' | 'development' | 'multimodal' | 'reasoning' | 'translation' | 'vision'
  costPerUnit?: number
  description: string
  apiKeyFormat: string
  logoUrl: string
  color: string
  hasWalletBalance?: boolean
  balanceCheckUrl?: string
  contextLength?: number
  inputPricing?: number
  outputPricing?: number
  imagePricing?: number
  provider: string
  modelName?: string
  capabilities?: string[]
  languages?: string[]
  specialFeatures?: string[]
  released?: string
  company: string
}

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  // OpenAI Models
  'openai-gpt4o': {
    name: 'openai-gpt4o',
    displayName: 'GPT-4o',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'multimodal',
    costPerUnit: 0.005,
    description: 'OpenAI\'s flagship multimodal model with vision, audio, and text capabilities',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/openai.png',
    color: '#10A37F',
    contextLength: 128000,
    inputPricing: 5.00,
    outputPricing: 15.00,
    imagePricing: 1.53,
    provider: 'OpenAI',
    capabilities: ['text', 'vision', 'audio', 'function-calling'],
    languages: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'],
    specialFeatures: ['Real-time voice', 'Vision understanding', 'Code interpreter'],
    company: 'OpenAI'
  },
  'openai-gpt41': {
    name: 'openai-gpt41',
    displayName: 'GPT-4.1',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'reasoning',
    costPerUnit: 0.002,
    description: 'Advanced instruction following with 1M context window for software engineering',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/openai.png',
    color: '#10A37F',
    contextLength: 1048576,
    inputPricing: 2.00,
    outputPricing: 8.00,
    provider: 'OpenAI',
    capabilities: ['long-context', 'coding', 'agents', 'reasoning'],
    specialFeatures: ['1M context', 'Code diffs', 'Agent reliability'],
    company: 'OpenAI'
  },
  'openai-gpt41-mini': {
    name: 'openai-gpt41-mini',
    displayName: 'GPT-4.1 Mini',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.0004,
    description: 'Mid-sized model with GPT-4o performance at lower cost and latency',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/openai.png',
    color: '#10A37F',
    contextLength: 1048576,
    inputPricing: 0.40,
    outputPricing: 1.60,
    provider: 'OpenAI',
    capabilities: ['coding', 'vision', 'fast-inference'],
    company: 'OpenAI'
  },
  'openai-gpt41-nano': {
    name: 'openai-gpt41-nano',
    displayName: 'GPT-4.1 Nano',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.0001,
    description: 'Fastest and cheapest in GPT-4.1 series with 1M context',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/openai.png',
    color: '#10A37F',
    contextLength: 1048576,
    inputPricing: 0.10,
    outputPricing: 0.40,
    provider: 'OpenAI',
    capabilities: ['classification', 'autocompletion', 'fast-inference'],
    company: 'OpenAI'
  },
  'openai-o3': {
    name: 'openai-o3',
    displayName: 'o3',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'reasoning',
    costPerUnit: 0.002,
    description: 'Advanced reasoning model for math, science, coding, and visual tasks',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/openai.png',
    color: '#10A37F',
    contextLength: 200000,
    inputPricing: 2.00,
    outputPricing: 8.00,
    imagePricing: 1.53,
    provider: 'OpenAI',
    capabilities: ['reasoning', 'math', 'science', 'coding', 'vision'],
    specialFeatures: ['Multi-step analysis', 'Technical writing'],
    company: 'OpenAI'
  },
  'openai-o4-mini': {
    name: 'openai-o4-mini',
    displayName: 'o4 Mini',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'reasoning',
    costPerUnit: 0.0011,
    description: 'Compact reasoning model optimized for speed and cost efficiency',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/openai.png',
    color: '#10A37F',
    contextLength: 200000,
    inputPricing: 1.10,
    outputPricing: 4.40,
    imagePricing: 0.842,
    provider: 'OpenAI',
    capabilities: ['reasoning', 'coding', 'multimodal', 'tools'],
    specialFeatures: ['Fast inference', 'Tool chaining', 'STEM tasks'],
    company: 'OpenAI'
  },
  'openai-o4-mini-high': {
    name: 'openai-o4-mini-high',
    displayName: 'o4 Mini High',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'reasoning',
    costPerUnit: 0.0011,
    description: 'o4-mini with reasoning_effort set to high for complex tasks',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/openai.png',
    color: '#10A37F',
    contextLength: 200000,
    inputPricing: 1.10,
    outputPricing: 4.40,
    imagePricing: 0.842,
    provider: 'OpenAI',
    capabilities: ['deep-reasoning', 'coding', 'multimodal', 'tools'],
    specialFeatures: ['High reasoning effort', 'Complex problem solving'],
    company: 'OpenAI'
  },

  // Anthropic Claude Models
  'claude-3-5-sonnet': {
    name: 'claude-3-5-sonnet',
    displayName: 'Claude 3.5 Sonnet',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.003,
    description: 'Anthropic\'s most capable model for complex reasoning and analysis',
    apiKeyFormat: 'sk-ant-...',
    logoUrl: '/logos/claude-color.png',
    color: '#D97706',
    contextLength: 200000,
    inputPricing: 3.00,
    outputPricing: 15.00,
    provider: 'Anthropic',
    capabilities: ['reasoning', 'analysis', 'writing', 'coding'],
    specialFeatures: ['Constitutional AI', 'Safe responses'],
    company: 'Anthropic'
  },
  'claude-3-haiku': {
    name: 'claude-3-haiku',
    displayName: 'Claude 3 Haiku',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.00025,
    description: 'Fast and efficient Claude model for quick tasks',
    apiKeyFormat: 'sk-ant-...',
    logoUrl: '/logos/claude-color.png',
    color: '#D97706',
    contextLength: 200000,
    inputPricing: 0.25,
    outputPricing: 1.25,
    provider: 'Anthropic',
    capabilities: ['fast-inference', 'text-processing', 'analysis'],
    company: 'Anthropic'
  },

  // Google Models
  'gemini-2-flash-exp': {
    name: 'gemini-2-flash-exp',
    displayName: 'Gemini 2.0 Flash Experimental',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'multimodal',
    costPerUnit: 0.0015,
    description: 'Google\'s experimental multimodal model with advanced capabilities',
    apiKeyFormat: 'AIza...',
    logoUrl: '/logos/gemini-color.png',
    color: '#4285F4',
    contextLength: 1048576,
    inputPricing: 0.00,
    outputPricing: 0.00,
    provider: 'Google',
    capabilities: ['multimodal', 'vision', 'audio', 'reasoning'],
    specialFeatures: ['Experimental features', 'Free tier'],
    company: 'Google'
  },
  'gemini-1-5-pro': {
    name: 'gemini-1-5-pro',
    displayName: 'Gemini 1.5 Pro',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'multimodal',
    costPerUnit: 0.00125,
    description: 'Production-ready Gemini with 2M context window',
    apiKeyFormat: 'AIza...',
    logoUrl: '/logos/gemini-color.png',
    color: '#4285F4',
    contextLength: 2097152,
    inputPricing: 1.25,
    outputPricing: 5.00,
    provider: 'Google',
    capabilities: ['long-context', 'multimodal', 'reasoning'],
    specialFeatures: ['2M context', 'Document analysis'],
    company: 'Google'
  },

  // DeepSeek Models
  'deepseek-r1': {
    name: 'deepseek-r1',
    displayName: 'DeepSeek R1',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'reasoning',
    costPerUnit: 0.0014,
    description: 'Advanced reasoning model with thinking capabilities',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/deepseek-color.png',
    color: '#1E40AF',
    hasWalletBalance: true,
    balanceCheckUrl: 'https://api.deepseek.com/user/balance',
    contextLength: 164000,
    inputPricing: 0.14,
    outputPricing: 0.28,
    provider: 'DeepSeek',
    capabilities: ['reasoning', 'thinking', 'math', 'coding'],
    specialFeatures: ['Chain of thought', 'Step-by-step reasoning'],
    company: 'DeepSeek'
  },
  'deepseek-v3': {
    name: 'deepseek-v3',
    displayName: 'DeepSeek V3',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.0014,
    description: 'Latest DeepSeek model with improved efficiency',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/deepseek-color.png',
    color: '#1E40AF',
    hasWalletBalance: true,
    contextLength: 164000,
    inputPricing: 0.14,
    outputPricing: 0.28,
    provider: 'DeepSeek',
    capabilities: ['coding', 'reasoning', 'efficiency'],
    company: 'DeepSeek'
  },
  'tng-deepseek-r1t-chimera': {
    name: 'tng-deepseek-r1t-chimera',
    displayName: 'DeepSeek R1T Chimera',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'reasoning',
    costPerUnit: 0.00025,
    description: 'Merged model combining R1 reasoning with V3 efficiency',
    apiKeyFormat: 'tng-...',
    logoUrl: '/logos/tng-logo.png',
    color: '#8B5CF6',
    contextLength: 164000,
    inputPricing: 0.25,
    outputPricing: 1.00,
    provider: 'TNG Technology',
    capabilities: ['reasoning', 'efficiency', 'general-purpose'],
    specialFeatures: ['Model merging', 'MIT license'],
    company: 'TNG Technology'
  },

  // Microsoft Models
  'microsoft-mai-ds-r1': {
    name: 'microsoft-mai-ds-r1',
    displayName: 'MAI DS R1',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'reasoning',
    costPerUnit: 0.00025,
    description: 'Microsoft\'s enhanced DeepSeek R1 with improved safety',
    apiKeyFormat: 'ms-...',
    logoUrl: '/logos/microsoft-color.png',
    color: '#0078D4',
    contextLength: 164000,
    inputPricing: 0.25,
    outputPricing: 1.00,
    provider: 'Microsoft',
    capabilities: ['reasoning', 'safety', 'multilingual'],
    specialFeatures: ['Enhanced safety', 'Unblocked topics', 'Tulu-3 integration'],
    company: 'Microsoft'
  },

  // THUDM Models
  'thudm-glm-z1-32b': {
    name: 'thudm-glm-z1-32b',
    displayName: 'GLM Z1 32B',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'reasoning',
    costPerUnit: 0.00004,
    description: 'Enhanced reasoning variant optimized for math and code',
    apiKeyFormat: 'glm-...',
    logoUrl: '/logos/thudm-logo.png',
    color: '#FF6B6B',
    contextLength: 33000,
    inputPricing: 0.04,
    outputPricing: 0.14,
    provider: 'THUDM',
    capabilities: ['math', 'reasoning', 'coding', 'tools'],
    specialFeatures: ['Reinforcement learning', 'Agentic workflows'],
    company: 'Tsinghua University'
  },
  'thudm-glm-4-plus': {
    name: 'thudm-glm-4-plus',
    displayName: 'GLM-4 Plus',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.00005,
    description: 'Advanced GLM model with enhanced capabilities',
    apiKeyFormat: 'glm-...',
    logoUrl: '/logos/thudm-logo.png',
    color: '#FF6B6B',
    contextLength: 128000,
    inputPricing: 0.05,
    outputPricing: 0.15,
    provider: 'THUDM',
    capabilities: ['text-generation', 'reasoning', 'multilingual'],
    specialFeatures: ['Long context', 'Chinese optimization'],
    company: 'Tsinghua University'
  },
  'thudm-glm-4-5': {
    name: 'thudm-glm-4-5',
    displayName: 'GLM-4.5',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.00003,
    description: 'Latest GLM model with improved performance and efficiency',
    apiKeyFormat: 'glm-...',
    logoUrl: '/logos/thudm-logo.png',
    color: '#FF6B6B',
    contextLength: 128000,
    inputPricing: 0.03,
    outputPricing: 0.12,
    provider: 'THUDM',
    capabilities: ['text-generation', 'reasoning', 'coding', 'multilingual'],
    specialFeatures: ['Latest generation', 'Improved efficiency', 'Better reasoning'],
    company: 'Tsinghua University'
  },

  // Z.ai Models (THUDM-based)
  'zai-glm-4-5': {
    name: 'zai-glm-4-5',
    displayName: 'Z.ai GLM-4.5',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.00003,
    description: 'Z.ai\'s GLM-4.5 model with enhanced features',
    apiKeyFormat: 'zai-...',
    logoUrl: '/logos/zai-logo.png',
    color: '#9333EA',
    contextLength: 128000,
    inputPricing: 0.03,
    outputPricing: 0.12,
    provider: 'Z.ai',
    capabilities: ['text-generation', 'reasoning', 'coding', 'multilingual'],
    specialFeatures: ['Z.ai optimization', 'Enhanced reasoning', 'Custom training'],
    company: 'Z.ai'
  },

  // Qwen Models
  'qwen-qwen3-235b-a22b': {
    name: 'qwen-qwen3-235b-a22b',
    displayName: 'Qwen3 235B A22B',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'reasoning',
    costPerUnit: 0.00018,
    description: '235B parameter MoE model with thinking/non-thinking modes',
    apiKeyFormat: 'qwen-...',
    logoUrl: '/logos/qwen-logo.png',
    color: '#FF6A00',
    contextLength: 131000,
    inputPricing: 0.18,
    outputPricing: 0.54,
    provider: 'Qwen',
    capabilities: ['reasoning', 'multilingual', 'tools', 'thinking'],
    specialFeatures: ['235B parameters', '100+ languages', 'Mode switching'],
    languages: ['English', 'Chinese', 'Japanese', 'Korean', 'Spanish', 'French'],
    company: 'Alibaba'
  },

  // Shisa AI Models
  'shisa-v2-llama-33-70b': {
    name: 'shisa-v2-llama-33-70b',
    displayName: 'Shisa V2 Llama 3.3 70B',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'translation',
    costPerUnit: 0.00004,
    description: 'Bilingual Japanese-English chat model',
    apiKeyFormat: 'shisa-...',
    logoUrl: '/logos/shisa-logo.png',
    color: '#E91E63',
    contextLength: 128000,
    inputPricing: 0.04,
    outputPricing: 0.14,
    provider: 'Shisa AI',
    capabilities: ['bilingual', 'translation', 'chat', 'instruction-following'],
    specialFeatures: ['Japanese optimization', 'ShareGPT training'],
    languages: ['Japanese', 'English'],
    company: 'Shisa AI'
  },

  // Image Generation Models
  'ideogram-v2': {
    name: 'ideogram-v2',
    displayName: 'Ideogram V2',
    usageMetric: 'images',
    usageUnit: 'images',
    category: 'image',
    costPerUnit: 0.08,
    description: 'Advanced AI image generation with text integration',
    apiKeyFormat: 'ideo_...',
    logoUrl: '/logos/ideogram-logo.png',
    color: '#8B5CF6',
    provider: 'Ideogram',
    capabilities: ['image-generation', 'text-in-images', 'style-control'],
    specialFeatures: ['Text rendering', 'Style consistency'],
    company: 'Ideogram'
  },
  'midjourney-v6': {
    name: 'midjourney-v6',
    displayName: 'Midjourney V6',
    usageMetric: 'images',
    usageUnit: 'images',
    category: 'image',
    costPerUnit: 0.10,
    description: 'Artistic AI image generation with superior quality',
    apiKeyFormat: 'mj-...',
    logoUrl: '/logos/midjourney.png',
    color: '#FF6B6B',
    provider: 'Midjourney',
    capabilities: ['artistic-generation', 'style-control', 'high-quality'],
    specialFeatures: ['Artistic style', 'Community gallery'],
    company: 'Midjourney'
  },
  'dall-e-3': {
    name: 'dall-e-3',
    displayName: 'DALL-E 3',
    usageMetric: 'images',
    usageUnit: 'images',
    category: 'image',
    costPerUnit: 0.040,
    description: 'OpenAI\'s advanced image generation model',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/openai.png',
    color: '#10A37F',
    provider: 'OpenAI',
    capabilities: ['image-generation', 'text-understanding', 'safety'],
    specialFeatures: ['Prompt adherence', 'Safety filtering'],
    company: 'OpenAI'
  },
  'stable-diffusion-3': {
    name: 'stable-diffusion-3',
    displayName: 'Stable Diffusion 3',
    usageMetric: 'images',
    usageUnit: 'images',
    category: 'image',
    costPerUnit: 0.035,
    description: 'Open-source image generation with commercial licensing',
    apiKeyFormat: 'sd-...',
    logoUrl: '/logos/stability-color.png',
    color: '#FF6B35',
    provider: 'Stability AI',
    capabilities: ['open-source', 'customizable', 'commercial-use'],
    specialFeatures: ['Open weights', 'Fine-tuning'],
    company: 'Stability AI'
  },

  // Audio Models
  'elevenlabs-v2': {
    name: 'elevenlabs-v2',
    displayName: 'ElevenLabs V2',
    usageMetric: 'characters',
    usageUnit: 'characters',
    category: 'audio',
    costPerUnit: 0.00003,
    description: 'Advanced AI voice synthesis and speech generation',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/elevenlabs-logo.png',
    color: '#10B981',
    provider: 'ElevenLabs',
    capabilities: ['voice-synthesis', 'voice-cloning', 'multilingual'],
    specialFeatures: ['Voice cloning', 'Emotion control'],
    languages: ['English', 'Spanish', 'French', 'German', 'Italian'],
    company: 'ElevenLabs'
  },
  'openai-whisper': {
    name: 'openai-whisper',
    displayName: 'Whisper',
    usageMetric: 'audio_seconds',
    usageUnit: 'seconds',
    category: 'audio',
    costPerUnit: 0.006,
    description: 'OpenAI\'s speech-to-text transcription model',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/openai.png',
    color: '#10A37F',
    provider: 'OpenAI',
    capabilities: ['speech-to-text', 'multilingual', 'translation'],
    specialFeatures: ['99 languages', 'Robust transcription'],
    languages: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'],
    company: 'OpenAI'
  },

  // Code Models
  'github-copilot': {
    name: 'github-copilot',
    displayName: 'GitHub Copilot',
    usageMetric: 'requests',
    usageUnit: 'suggestions',
    category: 'code',
    costPerUnit: 0.02,
    description: 'AI pair programmer for code completion and generation',
    apiKeyFormat: 'ghp_...',
    logoUrl: '/logos/copilot-logo.png',
    color: '#6366F1',
    provider: 'GitHub',
    capabilities: ['code-completion', 'code-generation', 'multi-language'],
    specialFeatures: ['IDE integration', 'Context awareness'],
    company: 'GitHub'
  },
  'cursor-ai': {
    name: 'cursor-ai',
    displayName: 'Cursor',
    usageMetric: 'requests',
    usageUnit: 'requests',
    category: 'code',
    costPerUnit: 0.01,
    description: 'AI-powered code editor with advanced features',
    apiKeyFormat: 'cur-...',
    logoUrl: '/logos/cursor-logo.png',
    color: '#8B5CF6',
    provider: 'Cursor',
    capabilities: ['code-editing', 'refactoring', 'debugging'],
    specialFeatures: ['Editor integration', 'Codebase understanding'],
    company: 'Anysphere'
  },
  'codeium': {
    name: 'codeium',
    displayName: 'Codeium',
    usageMetric: 'requests',
    usageUnit: 'completions',
    category: 'code',
    costPerUnit: 0.00,
    description: 'Free AI code completion and chat',
    apiKeyFormat: 'codeium-...',
    logoUrl: '/logos/codeium-logo.png',
    color: '#09B6A2',
    provider: 'Codeium',
    capabilities: ['code-completion', 'code-chat', 'multi-language'],
    specialFeatures: ['Free tier', 'Privacy focused'],
    company: 'Codeium'
  },

  // Legacy/Existing providers for compatibility
  openai: {
    name: 'openai',
    displayName: 'OpenAI (Generic)',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.002,
    description: 'OpenAI API access for various models',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/openai.png',
    color: '#10A37F',
    provider: 'OpenAI',
    company: 'OpenAI'
  },
  claude: {
    name: 'claude',
    displayName: 'Claude (Generic)',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.003,
    description: 'Anthropic Claude API access',
    apiKeyFormat: 'sk-ant-...',
    logoUrl: '/logos/claude-color.png',
    color: '#D97706',
    provider: 'Anthropic',
    company: 'Anthropic'
  },
  gemini: {
    name: 'gemini',
    displayName: 'Gemini (Generic)',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'multimodal',
    costPerUnit: 0.0015,
    description: 'Google Gemini API access',
    apiKeyFormat: 'AIza...',
    logoUrl: '/logos/gemini-color.png',
    color: '#4285F4',
    provider: 'Google',
    company: 'Google'
  },
  deepseek: {
    name: 'deepseek',
    displayName: 'DeepSeek (Generic)',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.0014,
    description: 'DeepSeek API access for various models',
    apiKeyFormat: 'sk-...',
    logoUrl: '/logos/deepseek-color.png',
    color: '#1E40AF',
    hasWalletBalance: true,
    provider: 'DeepSeek',
    company: 'DeepSeek'
  },
  thudm: {
    name: 'thudm',
    displayName: 'THUDM (Generic)',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.00004,
    description: 'THUDM GLM API access for various models',
    apiKeyFormat: 'glm-...',
    logoUrl: '/logos/thudm-logo.png',
    color: '#FF6B6B',
    hasWalletBalance: true,
    provider: 'THUDM',
    company: 'Tsinghua University'
  },
  zai: {
    name: 'zai',
    displayName: 'Z.ai (Generic)',
    usageMetric: 'tokens',
    usageUnit: 'tokens',
    category: 'text',
    costPerUnit: 0.00003,
    description: 'Z.ai API access for GLM models',
    apiKeyFormat: 'zai-...',
    logoUrl: '/logos/zai-logo.png',
    color: '#9333EA',
    hasWalletBalance: true,
    provider: 'Z.ai',
    company: 'Z.ai'
  }
}

export const getProviderConfig = (provider: string): ProviderConfig => {
  return PROVIDER_CONFIGS[provider] || PROVIDER_CONFIGS.openai
}

export const getAllProviders = (): ProviderConfig[] => {
  return Object.values(PROVIDER_CONFIGS)
}

export const getProvidersByCategory = (category?: string): ProviderConfig[] => {
  if (!category || category === 'all') return getAllProviders()
  return getAllProviders().filter(p => p.category === category)
}

export const getProvidersByCompany = (company: string): ProviderConfig[] => {
  return getAllProviders().filter(p => p.company.toLowerCase().includes(company.toLowerCase()))
}

export const searchProviders = (query: string): ProviderConfig[] => {
  if (!query.trim()) return getAllProviders()
  
  const searchTerm = query.toLowerCase()
  return getAllProviders().filter(provider => 
    provider.displayName.toLowerCase().includes(searchTerm) ||
    provider.description.toLowerCase().includes(searchTerm) ||
    provider.company.toLowerCase().includes(searchTerm) ||
    provider.category.toLowerCase().includes(searchTerm) ||
    provider.capabilities?.some(cap => cap.toLowerCase().includes(searchTerm)) ||
    provider.specialFeatures?.some(feature => feature.toLowerCase().includes(searchTerm)) ||
    provider.languages?.some(lang => lang.toLowerCase().includes(searchTerm))
  )
}

export const getUniqueCategories = (): string[] => {
  const categories = new Set(getAllProviders().map(p => p.category))
  return Array.from(categories).sort()
}

export const getUniqueCompanies = (): string[] => {
  const companies = new Set(getAllProviders().map(p => p.company))
  return Array.from(companies).sort()
}

export const formatUsage = (amount: number, metric: string): string => {
  switch (metric) {
    case 'tokens':
      return amount >= 1000000 ? `${(amount / 1000000).toFixed(1)}M tokens` :
             amount >= 1000 ? `${(amount / 1000).toFixed(1)}K tokens` : `${amount} tokens`
    case 'characters':
      return amount >= 1000000 ? `${(amount / 1000000).toFixed(1)}M chars` :
             amount >= 1000 ? `${(amount / 1000).toFixed(1)}K chars` : `${amount} chars`
    case 'images':
      return `${amount} ${amount === 1 ? 'image' : 'images'}`
    case 'audio_seconds':
      return amount >= 3600 ? `${(amount / 3600).toFixed(1)} hrs` :
             amount >= 60 ? `${(amount / 60).toFixed(1)} min` : `${amount}s`
    case 'requests':
      return `${amount} ${amount === 1 ? 'request' : 'requests'}`
    default:
      return `${amount} ${metric}`
  }
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount)
}

export const formatPricing = (pricing: number): string => {
  if (pricing === 0) return 'Free'
  if (pricing < 0.01) return `$${(pricing * 1000).toFixed(2)}/K tokens`
  return `$${pricing.toFixed(2)}/M tokens`
}
