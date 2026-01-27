import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { projects, users, gemExecutions, organizations } from '@/lib/database/schema';
import { eq, and, count, gte } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: 'No organization selected' }, { status: 400 });
    }

    // Get organization
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, orgId))
      .limit(1);

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get total projects count
    const [projectsCount] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.organizationId, organization.id));

    // Get active projects count
    const [activeProjectsCount] = await db
      .select({ count: count() })
      .from(projects)
      .where(
        and(
          eq(projects.organizationId, organization.id),
          eq(projects.isActive, true)
        )
      );

    // Get team members count (users in the organization)
    const [membersCount] = await db
      .select({ count: count() })
      .from(users);

    // Get gem executions this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [executionsCount] = await db
      .select({ count: count() })
      .from(gemExecutions)
      .innerJoin(projects, eq(gemExecutions.projectId, projects.id))
      .where(
        and(
          eq(projects.organizationId, organization.id),
          gte(gemExecutions.startedAt, startOfMonth)
        )
      );

    return NextResponse.json({
      totalProjects: projectsCount?.count || 0,
      activeProjects: activeProjectsCount?.count || 0,
      teamMembers: membersCount?.count || 0,
      gemExecutions: executionsCount?.count || 0,
      organizationName: organization.name,
      organizationImage: organization.imageUrl,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
