# 🚨 Fix Profile Upload Issues - Complete Guide

## 🔍 **Root Cause Identified:**

The **406/403 errors** indicate **Row Level Security (RLS)** permission issues. Your Supabase database is blocking authenticated users from accessing the `profiles` table.

## 🔧 **CRITICAL FIX - Apply RLS Policies:**

### **Step 1: Open Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your project: **zmyxqkjafhercgnjwrgk**
3. Navigate to: **SQL Editor** (left sidebar)

### **Step 2: Run RLS Policy Fix**
1. **Copy the entire contents** of `fix-rls-policies.sql` 
2. **Paste into SQL Editor** 
3. **Click "Run"** button

```sql
-- This will fix the permission issues
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to manage their own profiles
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
```

### **Step 3: Verify Policies Created**
1. Go to: **Authentication** → **Policies** 
2. You should see **3 new policies** for the `profiles` table:
   - `profiles_select_own`
   - `profiles_insert_own`  
   - `profiles_update_own`

## ⚡ **Fix Vite 431 Errors:**

The 431 errors have returned. Restart your dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## 🧪 **Test Profile Upload:**

### **After applying RLS policies:**

1. **Refresh your browser** at http://localhost:5173
2. **Sign in** with your Google account
3. **Go to Settings** → **Edit Profile** 
4. **Upload profile image** → **Save Changes**
5. ✅ **Should work!** No more 406/403 errors

## ⚠️ **Expected Behavior After Fix:**

### **✅ Working Console Logs:**
```
✅ Profile created successfully  
✅ Profile updated successfully
✅ User authenticated: your-email@gmail.com
```

### **❌ No More Error Logs:**
```
❌ Failed to load resource: 406
❌ Failed to load resource: 403  
❌ Error creating profile: Object
```

## 🎯 **If Still Having Issues:**

### **Double-Check RLS Policies:**
1. **Supabase Dashboard** → **Authentication** → **Policies**
2. **profiles table** should have **3 policies enabled**
3. Each policy should show **"Enabled"** status

### **Alternative: Temporarily Disable RLS (Testing Only):**
```sql
-- ONLY for testing - DO NOT use in production
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

## 🚀 **Once Fixed:**

Your profile image upload will work perfectly:
1. **Upload image** in Settings
2. **Image reflects** in header immediately  
3. **Database persistence** with proper permissions
4. **Complete end-to-end functionality**

The RLS policies ensure **secure access** - users can only manage their own profiles! 🔐

---

**Apply the RLS policies first, then test the profile upload!** 🎉
