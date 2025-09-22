# Tokerz API Key Manager

A comprehensive platform for managing AI service API keys with usage tracking, subscription management, and multi-provider support.

## 🚀 Features

- **Multi-Provider Support**: 30+ AI service providers (OpenAI, Claude, Gemini, Deepseek, etc.)
- **Usage Tracking**: Real-time monitoring and analytics
- **Subscription Management**: Free, Pro, and Enterprise tiers
- **Secure Storage**: Encrypted API key storage
- **Profile Management**: User profiles with image upload
- **Admin Dashboard**: Admin tools and audit logs
- **Payment Integration**: Stripe integration for subscriptions
- **Email Notifications**: Automated alerts and notifications

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Real-time + Auth + Storage)
- **Authentication**: Supabase Auth with OAuth support
- **Email**: Resend for transactional emails
- **Deployment**: Vercel with serverless functions
- **Styling**: Tailwind CSS + Framer Motion

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account and project
- Resend account for emails
- Vercel account for deployment

## 🔧 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd tokerz-api-manager
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Fill in your Supabase, Resend, and other service credentials.

4. Set up Supabase database:
```bash
# Run the schema in your Supabase SQL editor
cat supabase-schema.sql
```

5. Start the development server:
```bash
npm run dev
```

## 🗄 Database Schema

The application uses a comprehensive PostgreSQL schema with:

- **User Management**: Profiles, subscriptions, roles
- **API Key Storage**: Encrypted keys with usage limits
- **Usage Tracking**: Real-time transaction logging
- **Payment System**: Stripe integration, token purchases
- **Admin Features**: Audit logs, user management

See `supabase-schema.sql` for the complete database structure.

## 🔐 Environment Variables

Key environment variables needed:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Resend Email
RESEND_API_KEY=your-resend-key

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-id
GITHUB_CLIENT_ID=your-github-id
```

See `.env.example` for the complete list.

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Application pages
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries (Supabase client)
├── utils/              # Helper functions
└── entities/           # Data schemas (for reference)
```

## 🔄 Migration from Lumi.new

This project was migrated from Lumi.new to Supabase. See `MIGRATION_PLAN.md` for:

- Migration strategy and timeline
- Database mapping details
- Authentication flow changes
- Deployment configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Issues & Support

- Report bugs via GitHub Issues
- Feature requests welcome
- Check existing issues before creating new ones

## 🎯 Roadmap

- [ ] Real-time usage notifications
- [ ] Advanced analytics dashboard
- [ ] API rate limiting
- [ ] Multi-language support
- [ ] Mobile app integration
- [ ] Enterprise SSO support

---

Built with ❤️ for developers managing AI service integrations.
