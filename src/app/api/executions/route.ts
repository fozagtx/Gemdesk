import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { gemExecutions, projects, organizations } from '@/lib/database/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let query = db
      .select({
        id: gemExecutions.id,
        projectId: gemExecutions.projectId,
        projectName: projects.name,
        triggeredBy: gemExecutions.triggeredBy,
        status: gemExecutions.status,
        phase: gemExecutions.phase,
        startedAt: gemExecutions.startedAt,
        completedAt: gemExecutions.completedAt,
        durationMs: gemExecutions.durationMs,
        errorMessage: gemExecutions.errorMessage,
        results: gemExecutions.results,
      })
      .from(gemExecutions)
      .innerJoin(projects, eq(gemExecutions.projectId, projects.id));

    // Filter by project if specified
    if (projectId) {
      query = query.where(eq(gemExecutions.projectId, projectId));
    }

    // If orgId is present, filter by organization
    if (orgId) {
      const [organization] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.clerkOrgId, orgId))
        .limit(1);

      if (organization) {
        query = query.where(eq(projects.organizationId, organization.id));
      }
    }

    const executionsList = await query
      .orderBy(desc(gemExecutions.startedAt))
      .limit(100);

    return NextResponse.json({ executions: executionsList });
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}
