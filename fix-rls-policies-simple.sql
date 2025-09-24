-- Fix RLS policies that prevent saving data
-- This addresses the core issues preventing data persistence

-- Fix user_subscriptions policies (users need to INSERT their own subscriptions)
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can manage own subscription" ON user_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Fix token_purchases policies  
DROP POLICY IF EXISTS "Users can view own token purchases" ON token_purchases;
CREATE POLICY "Users can manage own token purchases" ON token_purchases FOR ALL USING (auth.uid() = user_id);

-- Fix payment_transactions policies
DROP POLICY IF EXISTS "Users can view own payments" ON payment_transactions;  
CREATE POLICY "Users can manage own payments" ON payment_transactions FOR ALL USING (auth.uid() = user_id);

-- Fix generated_api_keys policies
DROP POLICY IF EXISTS "Users can view own generated keys" ON generated_api_keys;
CREATE POLICY "Users can manage own generated keys" ON generated_api_keys FOR ALL USING (auth.uid() = user_id);

-- Ensure storage policies exist for avatar uploads
DROP POLICY IF EXISTS "avatar_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatar_select_policy" ON storage.objects;  
DROP POLICY IF EXISTS "avatar_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatar_delete_policy" ON storage.objects;

CREATE POLICY "avatar_upload_policy" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "avatar_select_policy" ON storage.objects FOR SELECT USING (
    bucket_id = 'avatars'
);

CREATE POLICY "avatar_update_policy" ON storage.objects FOR UPDATE WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "avatar_delete_policy" ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

-- Grant all necessary storage permissions
GRANT USAGE ON SCHEMA storage TO authenticated, anon;
GRANT ALL ON storage.objects TO authenticated, anon;
GRANT ALL ON storage.buckets TO authenticated, anon;

-- Ensure service role can bypass RLS (for admin operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Make sure anonymous users can sign up (needed for new user creation)
GRANT INSERT ON public.profiles TO anon;
GRANT INSERT ON public.user_subscriptions TO anon;
