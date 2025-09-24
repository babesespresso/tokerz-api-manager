// Wallet Balance API Integration
// This file contains API integrations for fetching wallet balances from various AI providers

export interface WalletBalanceResponse {
  balance: number;
  currency: string;
  lastUpdated?: string;
  error?: string;
}

export interface ProviderBalanceConfig {
  endpoint: string;
  headers: (apiKey: string) => Record<string, string>;
  parseResponse: (response: any) => WalletBalanceResponse;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

// Provider-specific balance API configurations
export const BALANCE_API_CONFIGS: Record<string, ProviderBalanceConfig> = {
  // OpenAI - No public wallet balance API (usage-based billing)
  openai: {
    endpoint: 'https://api.openai.com/v1/usage',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    parseResponse: (response) => ({
      balance: 0, // OpenAI doesn't provide balance, only usage
      currency: 'USD',
      error: 'OpenAI uses usage-based billing, no balance available'
    })
  },

  // Anthropic Claude - No public wallet balance API
  claude: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey: string) => ({
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    }),
    parseResponse: (response) => ({
      balance: 0,
      currency: 'USD',
      error: 'Anthropic uses usage-based billing, no balance available'
    })
  },

  // Google Gemini - No public wallet balance API
  gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
    }),
    parseResponse: (response) => ({
      balance: 0,
      currency: 'USD',
      error: 'Google Gemini uses quota-based system, no balance available'
    })
  },

  // DeepSeek - Has wallet balance API
  deepseek: {
    endpoint: 'https://api.deepseek.com/user/balance',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    parseResponse: (response) => {
      try {
        console.log('🔍 DeepSeek response structure:', JSON.stringify(response, null, 2));
        
        // DeepSeek API actual response format variations:
        // Format 1: { "is_available": true, "balance_infos": [{"balance": 10.5, "currency": "USD"}] }
        // Format 2: { "balance": 10.5, "currency": "USD" }
        // Format 3: { "balance_usd": 10.5 }
        
        let balance = 0;
        let currency = 'USD';
        
        if (response.balance_infos && Array.isArray(response.balance_infos) && response.balance_infos.length > 0) {
          const balanceInfo = response.balance_infos[0];
          console.log('💰 Balance info:', balanceInfo);
          
          // Extract balance - try multiple field names
          balance = parseFloat(
            balanceInfo.balance || 
            balanceInfo.available_balance || 
            balanceInfo.remaining_balance || 
            balanceInfo.balance_usd || 
            balanceInfo.amount ||
            balanceInfo.total_balance ||
            '0'
          );
          
          currency = balanceInfo.currency || balanceInfo.unit || 'USD';
        }
        // Check for direct balance fields in root response
        else if (response.balance !== undefined || response.balance_usd !== undefined) {
          balance = parseFloat(response.balance || response.balance_usd || '0');
          currency = response.currency || 'USD';
        }
        // Check for other possible field names
        else if (response.available_balance !== undefined) {
          balance = parseFloat(response.available_balance || '0');
          currency = response.currency || 'USD';
        }
        // Check for total_balance field
        else if (response.total_balance !== undefined) {
          balance = parseFloat(response.total_balance || '0');
          currency = response.currency || 'USD';
        }
        
        console.log(`💵 Extracted balance: ${balance} ${currency}`);
        
        // If we found a valid balance
        if (balance >= 0) {
          return {
            balance,
            currency,
            lastUpdated: new Date().toISOString()
          };
        }
        
        // If no balance found, return error
        console.warn('⚠️ No balance found in DeepSeek response:', response);
        return {
          balance: 0,
          currency: 'USD',
          error: `No balance information found in API response. Response: ${JSON.stringify(response)}`
        };
        
      } catch (error) {
        console.error('❌ DeepSeek parse error:', error);
        return {
          balance: 0,
          currency: 'USD',
          error: `Failed to parse DeepSeek balance response: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    },
    rateLimit: {
      maxRequests: 60,
      windowMs: 60 * 1000 // 1 minute
    }
  },

  // THUDM GLM - Wallet balance API
  thudm: {
    endpoint: 'https://open.bigmodel.cn/api/paas/v3/user/info',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    parseResponse: (response) => {
      try {
        console.log('🔍 THUDM response structure:', JSON.stringify(response, null, 2));
        
        // THUDM API response format variations:
        // Format 1: { "balance": 10.50, "currency": "CNY" }
        // Format 2: { "data": { "balance": 10.50, "currency": "CNY" } }
        // Format 3: { "user_info": { "balance": 10.50 } }
        
        let balance = 0;
        let currency = 'CNY';
        
        // Check for nested data structure
        const dataObject = response.data || response.user_info || response;
        
        // Try multiple field names for balance
        balance = parseFloat(
          dataObject.balance || 
          dataObject.remaining_balance || 
          dataObject.available_balance ||
          dataObject.total_balance ||
          dataObject.credit_balance ||
          '0'
        );
        
        currency = dataObject.currency || dataObject.unit || 'CNY';
        
        console.log(`💵 THUDM extracted balance: ${balance} ${currency}`);
        
        if (balance >= 0) {
          return {
            balance,
            currency,
            lastUpdated: new Date().toISOString()
          };
        }
        
        return {
          balance: 0,
          currency: 'CNY',
          error: `No balance information found in THUDM response. Response: ${JSON.stringify(response)}`
        };
      } catch (error) {
        console.error('❌ THUDM parse error:', error);
        return {
          balance: 0,
          currency: 'CNY',
          error: `Failed to parse THUDM balance response: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    },
    rateLimit: {
      maxRequests: 100,
      windowMs: 60 * 1000
    }
  },

  // Z.ai - CORS blocked, return appropriate message
  zai: {
    endpoint: 'https://api.z.ai/v1/user/balance',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    parseResponse: (response) => {
      // This will never be called due to CORS, but keeping for consistency
      return {
        balance: 0,
        currency: 'USD',
        error: 'Z.ai balance checking blocked by CORS policy. Use server-side implementation for production.'
      };
    },
    rateLimit: {
      maxRequests: 60,
      windowMs: 60 * 1000
    }
  },

  // ElevenLabs - Character-based credits system
  elevenlabs: {
    endpoint: 'https://api.elevenlabs.io/v1/user',
    headers: (apiKey: string) => ({
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    }),
    parseResponse: (response) => {
      try {
        console.log('🔍 ElevenLabs response structure:', JSON.stringify(response, null, 2));
        
        // Check for permission errors first
        if (response.detail && response.detail.status === 'missing_permissions') {
          console.warn('⚠️ ElevenLabs API key missing permissions:', response.detail.message);
          return {
            balance: 0,
            currency: 'characters',
            error: 'ElevenLabs API key missing user_read permission. Balance checking not available for this key.'
          };
        }
        
        // ElevenLabs API response format:
        // { "subscription": { "character_count": 9850, "character_limit": 10000, ... } }
        
        let balance = 0;
        let currency = 'characters';
        
        if (response.subscription) {
          const subscription = response.subscription;
          const used = parseInt(subscription.character_count) || 0;
          const limit = parseInt(subscription.character_limit) || 0;
          balance = Math.max(0, limit - used); // Remaining characters
          
          console.log(`💵 ElevenLabs credits: ${balance} characters remaining (${used}/${limit} used)`);
          
          return {
            balance,
            currency: 'characters',
            lastUpdated: new Date().toISOString(),
            used: used,
            limit: limit
          };
        }
        
        return {
          balance: 0,
          currency: 'characters',
          error: `No subscription information found in ElevenLabs response. Response: ${JSON.stringify(response)}`
        };
      } catch (error) {
        console.error('❌ ElevenLabs parse error:', error);
        return {
          balance: 0,
          currency: 'characters',
          error: `Failed to parse ElevenLabs balance response: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    },
    rateLimit: {
      maxRequests: 100,
      windowMs: 60 * 1000
    }
  }
};

// Rate limiting store
const rateLimitStore = new Map<string, { requests: number; resetTime: number }>();

// Check if request is within rate limit
function isWithinRateLimit(provider: string, config: ProviderBalanceConfig): boolean {
  if (!config.rateLimit) return true;

  const now = Date.now();
  const key = provider;
  const limit = rateLimitStore.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(key, {
      requests: 1,
      resetTime: now + config.rateLimit.windowMs
    });
    return true;
  }

  if (limit.requests >= config.rateLimit.maxRequests) {
    return false;
  }

  limit.requests++;
  return true;
}

// Cache for balance responses to avoid excessive API calls
const balanceCache = new Map<string, { data: WalletBalanceResponse; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedBalance(cacheKey: string): WalletBalanceResponse | null {
  const cached = balanceCache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  return null;
}

function setCachedBalance(cacheKey: string, data: WalletBalanceResponse) {
  balanceCache.set(cacheKey, {
    data,
    expiry: Date.now() + CACHE_DURATION
  });
}

// Main function to fetch wallet balance
export async function fetchWalletBalance(
  provider: string, 
  apiKey: string, 
  options?: { 
    skipCache?: boolean;
    timeout?: number;
  }
): Promise<WalletBalanceResponse> {
  // Normalize provider name to handle specific model variants
  const normalizedProvider = provider.split('-')[0] || provider;
  
  console.log(`🔍 Fetching wallet balance for provider: ${normalizedProvider}, key: ${apiKey.slice(0, 10)}...`);
  
  const config = BALANCE_API_CONFIGS[normalizedProvider];
  if (!config) {
    console.log(`❌ No configuration found for provider: ${normalizedProvider}`);
    return {
      balance: 0,
      currency: 'USD',
      error: `Wallet balance not supported for provider: ${provider}`
    };
  }

  // Check cache first
  const cacheKey = `${normalizedProvider}:${apiKey.slice(0, 10)}`;
  if (!options?.skipCache) {
    const cached = getCachedBalance(cacheKey);
    if (cached) {
      console.log(`📋 Using cached balance for ${normalizedProvider}: ${cached.currency} ${cached.balance}`);
      return cached;
    }
  }

  // Check rate limit
  if (!isWithinRateLimit(normalizedProvider, config)) {
    console.log(`⏱️ Rate limit exceeded for ${normalizedProvider}`);
    return {
      balance: 0,
      currency: 'USD',
      error: 'Rate limit exceeded for balance API'
    };
  }

  try {
    console.log(`🌐 Making API request to: ${config.endpoint}`);
    console.log(`🔑 Headers:`, Object.keys(config.headers(apiKey)));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout || 10000);

    const response = await fetch(config.endpoint, {
      method: 'GET',
      headers: config.headers(apiKey),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API error response:`, errorText);
      
      // Handle ElevenLabs permission errors specifically
      if (normalizedProvider === 'elevenlabs' && response.status === 401) {
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail && errorData.detail.status === 'missing_permissions') {
            return {
              balance: 0,
              currency: 'characters',
              error: 'ElevenLabs API key missing user_read permission. Balance checking not available for this key.'
            };
          }
        } catch (e) {
          // If error parsing fails, fall through to generic error
        }
      }
      
      return {
        balance: 0,
        currency: normalizedProvider === 'elevenlabs' ? 'characters' : 'USD',
        error: `API error: ${response.status} ${response.statusText} - ${errorText}`
      };
    }

    const data = await response.json();
    console.log(`📊 Raw API response:`, data);
    
    const result = config.parseResponse(data);
    console.log(`✅ Parsed balance result:`, result);
    
    // Cache successful response
    if (!result.error) {
      setCachedBalance(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Fetch error for ${normalizedProvider}:`, error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          balance: 0,
          currency: 'USD',
          error: 'Request timeout'
        };
      }
      return {
        balance: 0,
        currency: 'USD',
        error: `Network error: ${error.message}`
      };
    }
    return {
      balance: 0,
      currency: 'USD',
      error: 'Unknown error occurred'
    };
  }
}

// Batch balance fetching for multiple API keys
export async function fetchMultipleWalletBalances(
  apiKeys: Array<{ id: string; provider: string; apiKey: string }>
): Promise<Record<string, WalletBalanceResponse>> {
  const results: Record<string, WalletBalanceResponse> = {};
  
  // Process in batches to avoid overwhelming APIs
  const batchSize = 5;
  for (let i = 0; i < apiKeys.length; i += batchSize) {
    const batch = apiKeys.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (key) => {
      const result = await fetchWalletBalance(key.provider, key.apiKey);
      return { id: key.id, result };
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ id, result }) => {
      results[id] = result;
    });
    
    // Add small delay between batches
    if (i + batchSize < apiKeys.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

// Check if provider supports wallet balance
export function supportsWalletBalance(provider: string): boolean {
  const normalizedProvider = provider.split('-')[0] || provider;
  const config = BALANCE_API_CONFIGS[normalizedProvider];
  return config !== undefined && !config.parseResponse({}).error?.includes('not supported');
}

// Get supported providers for wallet balance
export function getSupportedBalanceProviders(): string[] {
  return Object.keys(BALANCE_API_CONFIGS).filter(provider => 
    supportsWalletBalance(provider)
  );
}

// Clear cache (useful for testing or forced refresh)
export function clearBalanceCache() {
  balanceCache.clear();
}

// Get cache status
export function getBalanceCacheInfo() {
  const now = Date.now();
  const cached = Array.from(balanceCache.entries()).map(([key, value]) => ({
    key,
    expired: now > value.expiry,
    expiryTime: new Date(value.expiry).toISOString()
  }));
  
  return {
    totalEntries: balanceCache.size,
    cached
  };
}
