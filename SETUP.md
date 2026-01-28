# Database Setup Instructions

## 1. Supabase Configuration

1. Create a Supabase project at https://supabase.com
2. Get your project credentials from the settings
3. Update your `.env.local` file with the following:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Google OAuth (for authentication)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Database Migration

Run the following command to create the database tables:

```bash
bun run scripts/migrate.ts
```

Or manually run migrations:

```bash
bun run db:migrate
```

## 3. Authentication Setup

### Enable Google OAuth in Supabase:
1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Add your OAuth credentials
4. Set the redirect URL to: `http://localhost:3000/auth/callback` (for development)

### Authentication Flow:
- Login page: `/auth/login`
- OAuth callback: `/auth/callback` (automatically handles Supabase OAuth flow)
- Protected dashboard: `/dashboard`

## 4. Testing

Start the development server:

```bash
bun run dev
```

Navigate to:
- `http://localhost:3000` - Landing page
- `http://localhost:3000/auth/login` - Login page
- `http://localhost:3000/dashboard` - Protected dashboard (after login)

## Database Schema

The system includes the following tables:
- `users` - User accounts (synced with Supabase Auth)
- `organizations` - Multi-tenant organizations
- `organization_members` - Organization membership
- `github_installations` - GitHub App installations
- `projects` - Connected repositories
- `documentation_files` - MDX documentation files
- `gem_executions` - AI agent workflow runs

## Troubleshooting

### OAuth 404 Error
If you get a 404 error during OAuth login:
- Ensure the callback route exists at `/auth/callback/route.ts`
- Check that your Supabase redirect URL is set to `{your-domain}/auth/callback`
- Verify your OAuth provider settings in Supabase

### Migration Errors
If migrations fail:
- Check that DATABASE_URL is correctly set in `.env.local`
- Ensure your Supabase database is accessible
- Verify the connection string format: `postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres`