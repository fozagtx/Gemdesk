-- Gemdesk Database Schema Setup for Supabase
-- Run this script in your Supabase SQL Editor

-- Users table (will sync with Supabase Auth)
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY NOT NULL,
  "email" text NOT NULL UNIQUE,
  "full_name" text,
  "avatar_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Organizations table for multi-tenancy
CREATE TABLE IF NOT EXISTS "organizations" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "description" text,
  "avatar_url" text,
  "owner_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Organization members for multi-tenancy
CREATE TABLE IF NOT EXISTS "organization_members" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "user_id" uuid NOT NULL,
  "role" text DEFAULT 'member' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- GitHub installations for app integration
CREATE TABLE IF NOT EXISTS "github_installations" (
  "id" text PRIMARY KEY NOT NULL,
  "installation_id" integer NOT NULL UNIQUE,
  "organization_id" text NOT NULL,
  "repositories" jsonb NOT NULL,
  "permissions" jsonb NOT NULL,
  "access_token" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Projects - each connected repository becomes a project
CREATE TABLE IF NOT EXISTS "projects" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "github_installation_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "repository_full_name" text NOT NULL,
  "repository_id" integer NOT NULL,
  "default_branch" text DEFAULT 'main' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "last_sync_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Documentation files managed by Gem agent
CREATE TABLE IF NOT EXISTS "documentation_files" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL,
  "file_path" text NOT NULL,
  "file_name" text NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "frontmatter" jsonb DEFAULT '{}'::jsonb,
  "last_gem_update" timestamp,
  "gem_update_count" integer DEFAULT 0 NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Gem agent workflow executions
CREATE TABLE IF NOT EXISTS "gem_executions" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL,
  "triggered_by" text NOT NULL,
  "status" text NOT NULL,
  "phase" text,
  "trigger_data" jsonb,
  "thought_signature" jsonb,
  "plan_data" jsonb,
  "results" jsonb,
  "error_message" text,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp,
  "duration_ms" integer
);

-- Add foreign key constraints
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_users_id_fk"
FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk"
FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "github_installations" ADD CONSTRAINT "github_installations_organization_id_organizations_id_fk"
FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk"
FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "projects" ADD CONSTRAINT "projects_github_installation_id_github_installations_id_fk"
FOREIGN KEY ("github_installation_id") REFERENCES "github_installations"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "documentation_files" ADD CONSTRAINT "documentation_files_project_id_projects_id_fk"
FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "gem_executions" ADD CONSTRAINT "gem_executions_project_id_projects_id_fk"
FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action;

-- Create Row Level Security (RLS) policies
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "github_installations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documentation_files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gem_executions" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON "users"
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON "users"
FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for organizations
CREATE POLICY "Organization members can view organizations" ON "organizations"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "organization_members"
    WHERE "organization_id" = "organizations"."id"
    AND "user_id" = auth.uid()
  )
);

CREATE POLICY "Organization owners can update organizations" ON "organizations"
FOR UPDATE USING (auth.uid() = "owner_id");

-- RLS Policies for organization members
CREATE POLICY "Organization members can view membership" ON "organization_members"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "organization_members" om
    WHERE om."organization_id" = "organization_members"."organization_id"
    AND om."user_id" = auth.uid()
  )
);

-- Insert a test notification
SELECT 'Database tables created successfully! ✅' AS result;