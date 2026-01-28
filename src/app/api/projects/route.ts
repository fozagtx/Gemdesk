import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/database/connection';
import { projects, organizations, githubInstallations, users, organizationMembers } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization membership
    const [membership] = await db
      .select({
        organizationId: organizationMembers.organizationId,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(users.email, user.email || ''))
      .limit(1);

    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Get organization
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, membership.organizationId))
      .limit(1);

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get all projects for the organization
    const projectsList = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        repositoryFullName: projects.repositoryFullName,
        defaultBranch: projects.defaultBranch,
        isActive: projects.isActive,
        lastSyncAt: projects.lastSyncAt,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(eq(projects.organizationId, organization.id))
      .orderBy(projects.createdAt);

    return NextResponse.json({ projects: projectsList });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
