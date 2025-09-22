# Supabase Authentication Setup Guide

## 🚀 Quick Setup: Enable Google OAuth in Supabase

Your app is now connected to a real Supabase project, but Google OAuth needs to be enabled. Here's how:

### Step 1: Enable Google OAuth Provider

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers** in the left sidebar
4. Find **Google** in the list of providers
5. Click the toggle to **Enable** Google OAuth
6. Configure the Google OAuth settings:

### Step 2: Configure OAuth Consent Screen (REQUIRED)

Before creating OAuth credentials, you MUST configure the consent screen:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Choose **External** user type → Click **CREATE**
5. Fill in required fields:
   - **App name**: "Tokerz API Key Manager" 
   - **User support email**: Your email (jreinecke1@gmail.com)
   - **Developer contact email**: Your email (jreinecke1@gmail.com)
6. Click **Save and Continue**
7. **Scopes**: Skip for now → **Save and Continue**
8. **Test users**: Add your email (jreinecke1@gmail.com) → **Save and Continue**
9. Click **Back to Dashboard**

### Step 3: Create OAuth Credentials

1. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Set **Application type** to "Web application"
3. **Name**: "Tokerz Web Client"
4. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5176
   https://your-domain.com
   ```
5. Add **Authorized redirect URIs**:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   (Replace `your-project-id` with your actual Supabase project ID)
6. Click **Create**

### Step 4: Add Google Credentials to Supabase

Back in your Supabase dashboard:
1. In **Authentication** → **Providers** → **Google**
2. Enter your **Google Client ID**
3. Enter your **Google Client Secret**  
4. Click **Save**

### Step 4: Test Authentication

Your app should now allow Google OAuth login! The error message will disappear and users can authenticate properly.

## 🔧 Alternative: Use Mock Authentication for Development

If you want to continue testing without setting up OAuth, you can revert to mock authentication by updating your `.env.local`:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

This will trigger the mock authentication mode and you can test the profile image functionality without OAuth setup.

## 📋 Profile Image Upload Testing

Once authentication is working, test the profile image upload:

1. **Login** → Navigate to **Settings**
2. Click **Edit** button
3. Click the **camera icon** next to profile picture
4. Select an image file (JPG/PNG, max 5MB)
5. Click **Save Changes**
6. Verify the image appears in:
   - Settings page profile section
   - Header navigation (top right)

The system automatically:
- ✅ Resizes images to 200x200px
- ✅ Compresses to optimize file size  
- ✅ Updates both local state and UI immediately
- ✅ Works with mock authentication for testing

## 🎯 Next Steps

1. Enable Google OAuth in Supabase (recommended for production)
2. Apply the database schema from `supabase-schema.sql` 
3. Test complete user profile flow
4. Deploy to production when ready

Your profile image upload functionality is fully implemented and ready to use! 🚀
