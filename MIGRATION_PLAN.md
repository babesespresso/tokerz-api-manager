# Tokerz API Key Manager - Migration Plan
## From Lumi.new to Supabase + Vercel + Resend

### Overview
This document outlines the complete migration strategy for moving from Lumi.new authentication to a modern, scalable stack using Supabase, Vercel, and Resend.

### Current System Analysis
- **Frontend**: React 18 + TypeScript + Vite
- **Authentication**: Lumi SDK (will be replaced)
- **Data**: JSON entity schemas (will become Supabase tables)
- **Features**: API key management, usage tracking, subscriptions, payments
- **Providers**: 30+ AI service providers supported

### Target Architecture
- **Database**: Supabase (PostgreSQL with real-time)
- **Authentication**: Supabase Auth (OAuth + email/password)
- **Email**: Resend for transactional emails
- **Storage**: Supabase Storage for profile images
- **Hosting**: Vercel with serverless functions
- **Frontend**: Same React app (minimal changes needed)

## Phase 1: Infrastructure Setup ✅ (In Progress)

### 1.1 Git Repository ✅
- [x] Initialize git repository
- [x] Create proper .gitignore
- [x] Initial commit with current codebase
- [ ] Create GitHub repository (pending auth completion)

### 1.2 Environment Configuration
- [ ] Create environment variable template
- [ ] Set up Vercel project
- [ ] Configure deployment settings

## Phase 2: Supabase Setup

### 2.1 Project Creation
- [ ] Create new Supabase project
- [ ] Configure database settings
- [ ] Set up authentication providers (Google, GitHub, etc.)

### 2.2 Database Migration
- [ ] Run the prepared SQL schema (supabase-schema.sql)
- [ ] Configure Row Level Security policies
- [ ] Set up database triggers and functions
- [ ] Test database connectivity

### 2.3 Storage Setup
- [ ] Create storage bucket for profile images
- [ ] Configure storage policies
- [ ] Set up image optimization

## Phase 3: Authentication Migration

### 3.1 Replace Lumi SDK
- [ ] Install Supabase client library
- [ ] Update package.json dependencies
- [ ] Remove @lumi.new/sdk dependency

### 3.2 Update Authentication Hook
- [ ] Rewrite useAuth.ts to use Supabase Auth
- [ ] Implement OAuth providers
- [ ] Add email verification flow
- [ ] Migrate profile management

### 3.3 Update Components
- [ ] Update login/signup flows
- [ ] Modify profile image upload to use Supabase Storage
- [ ] Update all authentication-dependent components

## Phase 4: Email Integration

### 4.1 Resend Setup
- [ ] Create Resend account and get API keys
- [ ] Set up email templates
- [ ] Configure SMTP settings

### 4.2 Email Templates
- [ ] Welcome email
- [ ] Email verification
- [ ] Password reset
- [ ] Usage alerts
- [ ] Subscription notifications

## Phase 5: Data Migration

### 5.1 API Key Management
- [ ] Implement encrypted storage for API keys
- [ ] Migrate existing API key structure
- [ ] Update key management UI

### 5.2 Usage Tracking
- [ ] Set up usage transaction logging
- [ ] Implement real-time usage updates
- [ ] Create usage analytics dashboard

### 5.3 Subscription System
- [ ] Migrate subscription logic
- [ ] Integrate with Stripe (if needed)
- [ ] Set up billing webhooks

## Phase 6: Testing & Deployment

### 6.1 Local Testing
- [ ] Test authentication flows
- [ ] Verify database operations
- [ ] Test email sending
- [ ] Validate profile image uploads

### 6.2 Production Deployment
- [ ] Deploy to Vercel
- [ ] Configure production environment variables
- [ ] Set up monitoring and logging
- [ ] Perform final testing

## Technical Details

### Dependencies to Add
```json
{
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/auth-helpers-react": "^0.4.2",
  "resend": "^2.0.0"
}
```

### Dependencies to Remove
```json
{
  "@lumi.new/sdk": "0.1.10"
}
```

### Environment Variables Needed
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend
RESEND_API_KEY=your-resend-api-key

# OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Key Files to Modify
1. `src/lib/lumi.ts` → `src/lib/supabase.ts`
2. `src/hooks/useAuth.ts` (complete rewrite)
3. `src/pages/Settings.tsx` (profile image handling)
4. `package.json` (dependencies)
5. Environment configuration files

### Benefits After Migration
- **Better Performance**: Direct PostgreSQL queries vs API calls
- **Real-time Updates**: Supabase real-time subscriptions
- **Better Security**: Row Level Security policies
- **Cost Effective**: No Lumi.new subscription fees
- **Scalability**: Supabase scales automatically
- **Email Reliability**: Resend has better deliverability
- **Image Storage**: Optimized with Supabase Storage
- **OAuth Flexibility**: Multiple providers supported

### Estimated Timeline
- **Phase 1-2**: 1-2 hours (setup)
- **Phase 3**: 2-3 hours (authentication migration)
- **Phase 4**: 1 hour (email setup)
- **Phase 5**: 2-3 hours (data migration)
- **Phase 6**: 1-2 hours (testing & deployment)

**Total: 7-11 hours**

### Rollback Plan
- Keep current Lumi version in a branch
- Environment variable switching for quick rollback
- Database backup before migration
- Incremental migration with feature flags
