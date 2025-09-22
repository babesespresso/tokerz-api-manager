-- Fix Row Level Security policies for profiles table
-- This enables authenticated users to read and write their own profiles

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles; 
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Create new RLS policies that allow users to manage their own profiles
CREATE POLICY "profiles_select_own" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Optional: Allow users to see other users' basic profile info (for team features)
-- CREATE POLICY "profiles_select_public" 
-- ON profiles FOR SELECT 
-- USING (true);
