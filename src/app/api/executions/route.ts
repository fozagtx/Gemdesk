import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/database/connection';
import { gemExecutions, projects, organizations, users } from '@/lib/database/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    // Get all executions with projects
    const executionsList = await db
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
      .innerJoin(projects, eq(gemExecutions.projectId, projects.id))
      .where(projectId ? eq(gemExecutions.projectId, projectId) : undefined)
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
