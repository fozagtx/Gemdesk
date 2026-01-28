import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Users table for Supabase Auth integration
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // UUID from Supabase Auth
  email: text('email').unique().notNull(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Organizations table for multi-tenancy
export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Organization members for multi-tenancy
export const organizationMembers = pgTable('organization_members', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organization_id').references(() => organizations.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: text('role').notNull().default('member'), // 'owner', 'admin', 'member'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// GitHub installations for app integration
export const githubInstallations = pgTable('github_installations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  installationId: integer('installation_id').unique().notNull(),
  organizationId: text('organization_id').references(() => organizations.id).notNull(),
  repositories: jsonb('repositories').$type<Array<{
    id: number;
    name: string;
    fullName: string;
    cloneUrl: string;
    defaultBranch: string;
  }>>().notNull(),
  permissions: jsonb('permissions').$type<Record<string, string>>().notNull(),
  accessToken: text('access_token'), // Encrypted
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Projects - each connected repository becomes a project
export const projects = pgTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organization_id').references(() => organizations.id).notNull(),
  githubInstallationId: text('github_installation_id').references(() => githubInstallations.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  repositoryFullName: text('repository_full_name').notNull(),
  repositoryId: integer('repository_id').notNull(),
  defaultBranch: text('default_branch').default('main').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Documentation files managed by Gem agent
export const documentationFiles = pgTable('documentation_files', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  projectId: text('project_id').references(() => projects.id).notNull(),
  filePath: text('file_path').notNull(), // Relative path in repository
  fileName: text('file_name').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(), // MDX content
  frontmatter: jsonb('frontmatter').$type<Record<string, any>>().default({}),
  lastGemUpdate: timestamp('last_gem_update'),
  gemUpdateCount: integer('gem_update_count').default(0).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Gem agent workflow executions
export const gemExecutions = pgTable('gem_executions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  projectId: text('project_id').references(() => projects.id).notNull(),
  triggeredBy: text('triggered_by').notNull(), // 'webhook', 'manual', 'scheduled'
  status: text('status').notNull(), // 'pending', 'running', 'completed', 'failed'
  phase: text('phase'), // 'audit', 'plan', 'draft', 'review', 'commit'
  triggerData: jsonb('trigger_data').$type<{
    commits?: Array<{
      id: string;
      message: string;
      files: string[];
    }>;
    webhookPayload?: any;
  }>(),
  thoughtSignature: jsonb('thought_signature').$type<{
    thought: string;
    action: string;
    confidence: number;
    requirements: string[];
  }>(),
  planData: jsonb('plan_data').$type<{
    filesToUpdate: string[];
    changes: Array<{
      filePath: string;
      reason: string;
      priority: string;
    }>;
  }>(),
  results: jsonb('results').$type<{
    updatedFiles: string[];
    commitHash?: string;
    pullRequestUrl?: string;
    errors?: string[];
  }>(),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  durationMs: integer('duration_ms'),
});


// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;
export type GitHubInstallation = typeof githubInstallations.$inferSelect;
export type NewGitHubInstallation = typeof githubInstallations.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type DocumentationFile = typeof documentationFiles.$inferSelect;
export type NewDocumentationFile = typeof documentationFiles.$inferInsert;
export type GemExecution = typeof gemExecutions.$inferSelect;
export type NewGemExecution = typeof gemExecutions.$inferInsert;
