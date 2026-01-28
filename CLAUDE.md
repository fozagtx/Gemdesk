# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development**: `bun run dev` - Start Next.js development server
- **Build**: `bun run build` - Build production bundle
- **Type Check**: `bun run type-check` - TypeScript type checking without emitting files
- **Lint**: `bun run lint` - ESLint checking

### Database Operations

- **Generate Schema**: `bun run db:generate` - Generate Drizzle migration files from schema
- **Migrate**: `bun run db:migrate` - Run database migrations
- **Push Schema**: `bun run db:push` - Push schema changes directly (dev only)
- **Studio**: `bun run db:studio` - Open Drizzle Studio for database inspection

## Architecture Overview

Gemdesk is an AI-native help center that uses the "Gem agent" to autonomously update documentation when code changes. The system follows a 5-phase autonomous workflow: Audit → Plan → Draft → Review → Commit.

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI primitives + Shadcn UI, Framer Motion for animations
- **Authentication**: Supabase (multi-tenant organizations)
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Gemini 3.0 Pro/Flash via Google AI SDK
- **State Management**: TanStack Query for server state
- **Git Integration**: GitHub App + Simple Git
- **Background Jobs**: Inngest

### Project Structure

```
src/
├── lib/
│   ├── aiServices/          # Gem agent AI logic (GeminiAgent class)
│   ├── githubServices/      # GitHub integration & webhook handling
│   ├── database/           # Drizzle schema & connection
│   ├── geminiClient/       # Gemini 3.0 client configuration
│   └── auth/               # Clerk authentication helpers
├── components/
│   ├── organization/       # Multi-tenant org management
│   ├── documentation/      # Doc viewing & editing components
│   ├── audit/             # Gem execution results
│   ├── layout/            # App layout components
│   └── ui/                # Reusable Radix/Shadcn components
├── app/                   # Next.js App Router
│   ├── api/               # API routes (GitHub webhooks, dashboard data)
│   └── dashboard/         # Protected dashboard pages
providers/                 # React context providers
```

### Database Schema

Core entities managed by Drizzle ORM:
- **organizations**: Multi-tenant org structure
- **githubInstallations**: GitHub App installations per org
- **projects**: Connected repositories (one per GitHub repo)
- **gemExecutions**: AI agent workflow runs with 5-phase tracking
- **documentationFiles**: MDX files managed by Gem agent
- **gemAssets**: Screenshots and generated assets

### AI Architecture (Gem Agent)

The `GeminiAgent` class in `src/lib/aiServices/geminiAgent.ts` implements the core AI workflow:

1. **analyzeCodebase()**: Uses git diff to detect documentation impact
2. **draftDocumentationUpdate()**: Generates MDX content updates
3. **generateScreenshotInstructions()**: Creates Playwright capture steps
4. **validateDocumentationUpdate()**: Quality checks generated content

Uses structured output with Zod schemas for reliable AI responses, including the "thought signature" pattern for explainable AI decisions.

### GitHub Integration

- **Webhook Handler**: `/api/github/webhook` processes push/PR events
- **Repository Analyzer**: Detects file changes requiring doc updates
- **Commit Manager**: Creates automated documentation PRs
- **GitHub App**: Required permissions: Contents (R/W), Pull requests (W), Metadata (R)

### Authentication & Multi-tenancy

Clerk provides organization-based multi-tenancy. Each organization can connect multiple GitHub repositories as projects. User management is handled through Clerk's organization features.

### Environment Setup

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Supabase (auth + database)
- `DATABASE_URL`: Points to Supabase PostgreSQL instance
- `GOOGLE_GENERATIVE_AI_API_KEY`: Gemini 3.0 access
- `GITHUB_*`: GitHub App credentials
- `INNGEST_*`: Background job processing

## Development Patterns

- **Use bun**: Package manager and command runner
- **camelCase naming**: Components, functions, and file names
- **TanStack Query**: Prefer over useEffect for data fetching
- **Drizzle ORM**: Database operations use typed schema
- **Error Boundaries**: UI components handle async states properly
- **Clerk**: Authentication state management throughout app
- **Parallel imports**: Multiple components from `@/components/ui`

## File Organization

- UI components in `src/components/ui/` follow Shadcn structure
- Business logic separated into `src/lib/` services
- API routes use Next.js App Router pattern
- Database migrations auto-generated in `src/lib/database/migrations/`