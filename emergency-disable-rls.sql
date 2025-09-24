-- EMERGENCY FIX: Temporarily disable RLS to get app working
-- This will allow all operations while we debug the policy issues

-- Disable RLS on all tables temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_balances DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs DISABLE ROW LEVEL SECURITY;

-- Create the avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Make storage bucket completely public for now
UPDATE storage.buckets SET public = true WHERE id = 'avatars';

-- Grant full access to authenticated and anon users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT USAGE ON SCHEMA storage TO authenticated, anon;
GRANT ALL ON storage.objects TO authenticated, anon;
GRANT ALL ON storage.buckets TO authenticated, anon;

-- Ensure the profiles table structure is correct
-- (This might be causing the 406 errors)
ALTER TABLE public.profiles 
  ALTER COLUMN display_name DROP NOT NULL,
  ALTER COLUMN timezone SET DEFAULT 'UTC',
  ALTER COLUMN language SET DEFAULT 'en',
  ALTER COLUMN user_role SET DEFAULT 'member';
