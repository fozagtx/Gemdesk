# Gemdesk - AI-Native Help Center

> **Autonomous documentation that keeps itself up-to-date with Gemini 3.0**

Gemdesk is an AI-powered documentation platform that automatically updates your help center when your code changes. Built with Next.js 15, PostgreSQL, Clerk, and Gemini 3.0, it provides enterprise-grade autonomous documentation management.

## Features

- **Autonomous Updates**: Gem agent automatically updates docs when code changes
- **Gemini 3.0 Powered**: Advanced AI with 2M+ token context and multimodal understanding
- **GitHub Integration**: Seamless webhook-driven workflow with GitHub App
- **Smart Screenshots**: Automated UI capture with intelligent annotations
- **Multi-tenancy**: Organization-level management with Clerk authentication
- **Real-time**: Live updates and streaming AI responses
- **MDX Support**: Rich documentation with React components

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- GitHub repository
- Google Cloud account (for Gemini 3.0)
- Clerk account

### 1. Clone and Install

```bash
git clone <your-repo>
cd gemdesk
bun install
```

### 2. Environment Setup

Copy the environment template and configure:

```bash
cp .env.example .env.local
```

**Required Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gemdesk

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Gemini 3.0
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyxxxxx

# GitHub App (create at https://github.com/settings/apps/new)
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
GITHUB_CLIENT_ID=Iv1.xxxxx
GITHUB_CLIENT_SECRET=xxxxx
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate database schema
bun run db:generate

# Run migrations
bun run db:migrate

# (Optional) View database
bun run db:studio
```

### 4. GitHub App Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/apps/new)
2. Create a new GitHub App with these settings:
   - **Homepage URL**: `http://localhost:3000`
   - **Webhook URL**: `http://localhost:3000/api/github/webhook`
   - **Permissions**:
     - Contents: Read & Write
     - Pull requests: Write
     - Metadata: Read
   - **Events**: push, pull_request, installation

3. Generate and download private key
4. Install the app on your target repositories

### 5. Start Development

```bash
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access Gemdesk.

## Architecture

### Technology Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI + Framer Motion
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Clerk (multi-tenant)
- **AI**: Gemini 3.0 Pro/Flash via Google AI SDK
- **Git Integration**: GitHub App + Simple Git
- **Background Jobs**: Inngest
- **File Storage**: Cloudflare R2 (optional)

### Project Structure

```
src/
├── components/          # React components
│   ├── aiAgent/        # AI-related components
│   ├── documentation/  # Doc management UI
│   ├── ui/            # Reusable UI components
│   └── layout/        # Layout components
├── lib/               # Core utilities
│   ├── aiServices/    # Gem agent logic
│   ├── githubServices/ # GitHub integration
│   ├── database/      # Database schema & connection
│   ├── geminiClient/  # Gemini 3.0 integration
│   └── auth/          # Authentication helpers
├── app/               # Next.js App Router
│   ├── dashboard/     # User dashboard
│   ├── helpCenter/    # Public help center
│   └── api/           # API routes
└── types/             # TypeScript types

docs/                  # Sample MDX documentation
scripts/               # Deployment scripts
```

## How the Gem Agent Works

The Gem agent follows a 5-phase autonomous workflow:

1. **Audit**: Monitors repository changes via webhooks
2. **Plan**: AI analyzes impact and creates update plan
3. **Draft**: Gemini 3.0 generates documentation content
4. **Review**: Captures screenshots and validates content
5. **Commit**: Creates PR with documentation updates

### Configuration

Create `.gemdesk.yml` in your repository:

```yaml
triggers:
  - file_patterns: ['src/**/*.ts', 'components/**/*.tsx']
  - ignore_patterns: ['**/*.test.ts']

quality:
  minimum_confidence: 0.8
  auto_merge_threshold: 0.95

templates:
  api_endpoint:
    sections: ['Description', 'Parameters', 'Response', 'Examples']
```

## Development

### Database Commands

```bash
bun run db:generate   # Generate migration files
bun run db:migrate    # Run migrations
bun run db:push       # Push schema changes
bun run db:studio     # Open Drizzle Studio
```

### Type Checking

```bash
bun run type-check    # TypeScript type checking
bun run lint          # ESLint checking
```

### Testing

```bash
bun run test          # Run test suite
bun run test:watch    # Watch mode
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables for Production

```bash
# Production Database (use Neon, Supabase, or PlanetScale)
DATABASE_URL=postgresql://prod-connection-string

# Clerk Production Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Production GitHub App
GITHUB_APP_ID=prod-app-id
GITHUB_WEBHOOK_SECRET=secure-webhook-secret

# Production URL
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

## Documentation

- [Getting Started Guide](docs/getting-started.mdx)
- [API Reference](docs/api-reference.mdx)
- [Gem Agent Deep Dive](docs/gem-agent.mdx)
- [Configuration Options](docs/configuration.mdx)
- [Deployment Guide](docs/deployment.mdx)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Support

- Email: [support@gemdesk.ai](mailto:support@gemdesk.ai)
- Discord: [Join our community](https://discord.gg/gemdesk)
- Documentation: [docs.gemdesk.ai](https://docs.gemdesk.ai)
- Issues: [GitHub Issues](https://github.com/your-org/gemdesk/issues)

---

**Built with care by the Gemdesk team**
