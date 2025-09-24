-- Complete fix for profile image upload issues
-- This addresses both RLS policies and storage bucket setup

-- 1. First, ensure profiles table has proper RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. Create storage bucket for avatars (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create storage policies for avatar uploads
-- Allow authenticated users to upload their own avatar
CREATE POLICY "avatar_upload_policy" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Allow users to view all avatars (public bucket)
CREATE POLICY "avatar_select_policy" ON storage.objects FOR SELECT USING (
    bucket_id = 'avatars'
);

-- Allow users to update their own avatar
CREATE POLICY "avatar_update_policy" ON storage.objects FOR UPDATE WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Allow users to delete their own avatar
CREATE POLICY "avatar_delete_policy" ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- 4. Fix any potential trigger issues with profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        updated_at = NOW();
    
    -- Create default free subscription if it doesn't exist
    INSERT INTO public.user_subscriptions (user_id, plan_type, status, started_at)
    VALUES (NEW.id, 'free', 'active', NOW())
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Create a function to safely clean up old avatar files when updating
CREATE OR REPLACE FUNCTION cleanup_old_avatar()
RETURNS TRIGGER AS $$
BEGIN
    -- If avatar_url is being changed and old one exists, we could add cleanup logic here
    -- For now, just update the timestamp
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger for avatar cleanup
DROP TRIGGER IF EXISTS cleanup_avatar_on_update ON profiles;
CREATE TRIGGER cleanup_avatar_on_update 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    WHEN (OLD.avatar_url IS DISTINCT FROM NEW.avatar_url)
    EXECUTE FUNCTION cleanup_old_avatar();

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
