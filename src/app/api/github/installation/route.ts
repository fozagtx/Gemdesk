import { NextRequest, NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth/userManagement';
import { db } from '@/lib/database/connection';
import { githubInstallations, projects } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

// Get GitHub installations for organization
export async function GET() {
  try {
    const user = await requireOrganization();

    const installations = await db
      .select()
      .from(githubInstallations)
      .where(eq(githubInstallations.organizationId, user.organization.id));

    return NextResponse.json({ installations });
  } catch (error) {
    console.error('Error fetching installations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installations' },
      { status: 500 }
    );
  }
}

// Create or update GitHub installation
export async function POST(request: NextRequest) {
  try {
    const user = await requireOrganization();
    const body = await request.json();

    const { installationId, repositories, permissions, accessToken } = body;

    // Check if installation already exists
    const existingInstallation = await db
      .select()
      .from(githubInstallations)
      .where(eq(githubInstallations.installationId, installationId))
      .limit(1);

    if (existingInstallation.length > 0) {
      // Update existing installation
      const updated = await db
        .update(githubInstallations)
        .set({
          repositories,
          permissions,
          accessToken, // TODO: Encrypt this
          updatedAt: new Date(),
        })
        .where(eq(githubInstallations.id, existingInstallation[0].id))
        .returning();

      return NextResponse.json({ installation: updated[0] });
    }

    // Create new installation
    const newInstallation = await db
      .insert(githubInstallations)
      .values({
        installationId,
        organizationId: user.organization.id,
        repositories,
        permissions,
        accessToken, // TODO: Encrypt this
      })
      .returning();

    // Create projects for each repository
    const projectPromises = repositories.map(async (repo: any) => {
      return db.insert(projects).values({
        organizationId: user.organization.id,
        githubInstallationId: newInstallation[0].id,
        name: repo.name,
        repositoryFullName: repo.fullName,
        repositoryId: repo.id,
        defaultBranch: repo.defaultBranch,
      });
    });

    await Promise.all(projectPromises);

    return NextResponse.json({ installation: newInstallation[0] });
  } catch (error) {
    console.error('Error creating/updating installation:', error);
    return NextResponse.json(
      { error: 'Failed to create installation' },
      { status: 500 }
    );
  }
}

// Delete GitHub installation
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireOrganization();
    const { searchParams } = new URL(request.url);
    const installationId = searchParams.get('installationId');

    if (!installationId) {
      return NextResponse.json(
        { error: 'Installation ID is required' },
        { status: 400 }
      );
    }

    // Delete installation and related projects
    await db
      .delete(githubInstallations)
      .where(
        eq(githubInstallations.installationId, parseInt(installationId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting installation:', error);
    return NextResponse.json(
      { error: 'Failed to delete installation' },
      { status: 500 }
    );
  }
}