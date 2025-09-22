// Database type definitions for Supabase
// This will be auto-generated when we set up Supabase CLI

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          email: string
          avatar_url: string | null
          timezone: string
          language: string
          user_role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          email: string
          avatar_url?: string | null
          timezone?: string
          language?: string
          user_role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          email?: string
          avatar_url?: string | null
          timezone?: string
          language?: string
          user_role?: string
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          provider: string
          key_name: string
          encrypted_key: string
          key_preview: string
          status: string
          usage_limit: number
          current_usage: number
          usage_metric: string
          provider_category: string
          provider_company: string | null
          context_length: number | null
          input_pricing: number | null
          output_pricing: number | null
          image_pricing: number | null
          capabilities: string[] | null
          special_features: string[] | null
          supported_languages: string[] | null
          last_used: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          key_name: string
          encrypted_key: string
          key_preview: string
          status?: string
          usage_limit?: number
          current_usage?: number
          usage_metric: string
          provider_category: string
          provider_company?: string | null
          context_length?: number | null
          input_pricing?: number | null
          output_pricing?: number | null
          image_pricing?: number | null
          capabilities?: string[] | null
          special_features?: string[] | null
          supported_languages?: string[] | null
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          key_name?: string
          encrypted_key?: string
          key_preview?: string
          status?: string
          usage_limit?: number
          current_usage?: number
          usage_metric?: string
          provider_category?: string
          provider_company?: string | null
          context_length?: number | null
          input_pricing?: number | null
          output_pricing?: number | null
          image_pricing?: number | null
          capabilities?: string[] | null
          special_features?: string[] | null
          supported_languages?: string[] | null
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_transactions: {
        Row: {
          id: string
          user_id: string
          api_key_id: string
          provider: string
          transaction_type: string
          amount: number
          unit: string
          cost_usd: number | null
          model_used: string | null
          metadata: any | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          api_key_id: string
          provider: string
          transaction_type: string
          amount: number
          unit: string
          cost_usd?: number | null
          model_used?: string | null
          metadata?: any | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          api_key_id?: string
          provider?: string
          transaction_type?: string
          amount?: number
          unit?: string
          cost_usd?: number | null
          model_used?: string | null
          metadata?: any | null
          timestamp?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: string
          status: string
          max_api_keys: number
          monthly_fee: number
          billing_cycle: string
          started_at: string
          expires_at: string | null
          last_payment: string | null
          next_payment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: string
          status: string
          max_api_keys?: number
          monthly_fee?: number
          billing_cycle?: string
          started_at: string
          expires_at?: string | null
          last_payment?: string | null
          next_payment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: string
          status?: string
          max_api_keys?: number
          monthly_fee?: number
          billing_cycle?: string
          started_at?: string
          expires_at?: string | null
          last_payment?: string | null
          next_payment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_plan_type: 'free' | 'pro' | 'enterprise'
      subscription_status: 'active' | 'canceled' | 'expired' | 'trial'
      billing_cycle: 'monthly' | 'yearly'
      api_key_status: 'active' | 'inactive' | 'expired' | 'suspended'
      usage_metric: 'tokens' | 'requests' | 'characters' | 'images' | 'audio_seconds'
      provider_category: 'text' | 'image' | 'audio' | 'code' | 'development' | 'multimodal' | 'reasoning' | 'translation' | 'vision'
      transaction_type: 'usage' | 'purchase' | 'refund' | 'credit'
      unit_type: 'tokens' | 'requests' | 'characters' | 'images' | 'audio_seconds' | 'usd'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
