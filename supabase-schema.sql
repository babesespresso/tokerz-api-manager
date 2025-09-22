-- Tokerz API Key Manager - Supabase Database Schema
-- Migration from Lumi.new to Supabase + Vercel + Resend

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE subscription_plan_type AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired', 'trial');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
CREATE TYPE api_key_status AS ENUM ('active', 'inactive', 'expired', 'suspended');
CREATE TYPE usage_metric AS ENUM ('tokens', 'requests', 'characters', 'images', 'audio_seconds');
CREATE TYPE provider_category AS ENUM ('text', 'image', 'audio', 'code', 'development', 'multimodal', 'reasoning', 'translation', 'vision');
CREATE TYPE transaction_type AS ENUM ('usage', 'purchase', 'refund', 'credit');
CREATE TYPE unit_type AS ENUM ('tokens', 'requests', 'characters', 'images', 'audio_seconds', 'usd');

-- Extend the default auth.users table with profiles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    user_role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_type subscription_plan_type NOT NULL,
    status subscription_status NOT NULL,
    max_api_keys INTEGER DEFAULT 5,
    monthly_fee DECIMAL(10,2) DEFAULT 0,
    billing_cycle billing_cycle DEFAULT 'monthly',
    started_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ,
    last_payment TIMESTAMPTZ,
    next_payment TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (with encryption)
CREATE TABLE public.api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    key_name TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    key_preview TEXT NOT NULL,
    status api_key_status DEFAULT 'active',
    usage_limit BIGINT DEFAULT 0,
    current_usage BIGINT DEFAULT 0,
    usage_metric usage_metric NOT NULL,
    provider_category provider_category NOT NULL,
    provider_company TEXT,
    context_length INTEGER,
    input_pricing DECIMAL(12,8),
    output_pricing DECIMAL(12,8),
    image_pricing DECIMAL(12,8),
    capabilities TEXT[],
    special_features TEXT[],
    supported_languages TEXT[],
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage transactions
CREATE TABLE public.usage_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    transaction_type transaction_type NOT NULL,
    amount BIGINT NOT NULL,
    unit unit_type NOT NULL,
    cost_usd DECIMAL(12,8),
    model_used TEXT,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Token balances
CREATE TABLE public.token_balances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    balance BIGINT DEFAULT 0,
    total_purchased BIGINT DEFAULT 0,
    total_used BIGINT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Token purchases
CREATE TABLE public.token_purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    tokens_purchased BIGINT NOT NULL,
    cost_usd DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    stripe_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE public.payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    stripe_payment_id TEXT,
    status TEXT DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated API keys (for internal API access)
CREATE TABLE public.generated_api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    key_name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_preview TEXT NOT NULL,
    permissions JSONB DEFAULT '[]',
    last_used TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupon codes
CREATE TABLE public.coupon_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER,
    discount_amount DECIMAL(10,2),
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin logs
CREATE TABLE public.admin_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- API Keys policies
CREATE POLICY "Users can manage own API keys" ON api_keys FOR ALL USING (auth.uid() = user_id);

-- Usage transactions policies
CREATE POLICY "Users can view own usage" ON usage_transactions FOR SELECT USING (auth.uid() = user_id);

-- Token balances policies
CREATE POLICY "Users can view own balances" ON token_balances FOR ALL USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Only admins can access admin logs" ON admin_logs FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_role = 'admin'
    )
);

-- Indexes for performance
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_provider ON api_keys(provider);
CREATE INDEX idx_usage_transactions_user_id ON usage_transactions(user_id);
CREATE INDEX idx_usage_transactions_timestamp ON usage_transactions(timestamp);
CREATE INDEX idx_token_balances_user_id ON token_balances(user_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
    
    -- Create default free subscription
    INSERT INTO public.user_subscriptions (user_id, plan_type, status, started_at)
    VALUES (NEW.id, 'free', 'active', NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
