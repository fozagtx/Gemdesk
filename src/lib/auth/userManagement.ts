import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/database/connection';
import { users, organizations, type NewUser, type NewOrganization } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

export interface UserWithOrg {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

export async function getCurrentUserWithOrg(): Promise<UserWithOrg | null> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  // Get or create user in database
  const dbUser = await getOrCreateUser(clerkUser);

  // Get user's organization if they have one
  let organization;
  if (clerkUser.organizationMemberships?.[0]) {
    const orgMembership = clerkUser.organizationMemberships[0];
    organization = await getOrCreateOrganization(orgMembership.organization);
  }

  return {
    ...dbUser,
    organization
  };
}

export async function getOrCreateUser(clerkUser: any): Promise<{
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
}> {
  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error('User must have an email address');
  }

  // Check if user exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (existingUser.length > 0) {
    // Update user info if needed
    const user = existingUser[0];
    if (
      user.email !== email ||
      user.name !== clerkUser.fullName ||
      user.imageUrl !== clerkUser.imageUrl
    ) {
      await db
        .update(users)
        .set({
          email,
          name: clerkUser.fullName,
          imageUrl: clerkUser.imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return {
        ...user,
        email,
        name: clerkUser.fullName,
        imageUrl: clerkUser.imageUrl,
      };
    }

    return user;
  }

  // Create new user
  const newUser: NewUser = {
    id: clerkUser.id,
    clerkId: clerkUser.id,
    email,
    name: clerkUser.fullName || null,
    imageUrl: clerkUser.imageUrl || null,
  };

  const created = await db
    .insert(users)
    .values(newUser)
    .returning();

  return created[0];
}

export async function getOrCreateOrganization(clerkOrg: any): Promise<{
  id: string;
  name: string;
  slug: string;
}> {
  // Check if organization exists
  const existingOrg = await db
    .select()
    .from(organizations)
    .where(eq(organizations.clerkOrgId, clerkOrg.id))
    .limit(1);

  if (existingOrg.length > 0) {
    const org = existingOrg[0];

    // Update organization info if needed
    if (
      org.name !== clerkOrg.name ||
      org.slug !== clerkOrg.slug ||
      org.imageUrl !== clerkOrg.imageUrl
    ) {
      await db
        .update(organizations)
        .set({
          name: clerkOrg.name,
          slug: clerkOrg.slug,
          imageUrl: clerkOrg.imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, org.id));

      return {
        ...org,
        name: clerkOrg.name,
        slug: clerkOrg.slug,
      };
    }

    return org;
  }

  // Create new organization
  const newOrg: NewOrganization = {
    clerkOrgId: clerkOrg.id,
    name: clerkOrg.name,
    slug: clerkOrg.slug,
    imageUrl: clerkOrg.imageUrl || null,
  };

  const created = await db
    .insert(organizations)
    .values(newOrg)
    .returning();

  return created[0];
}

export async function requireAuth(): Promise<UserWithOrg> {
  const user = await getCurrentUserWithOrg();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

export async function requireOrganization(): Promise<UserWithOrg & { organization: NonNullable<UserWithOrg['organization']> }> {
  const user = await requireAuth();

  if (!user.organization) {
    throw new Error('Organization membership required');
  }

  return user as UserWithOrg & { organization: NonNullable<UserWithOrg['organization']> };
}

export async function checkUserPermission(
  userId: string,
  organizationId: string,
  permission: 'read' | 'write' | 'admin'
): Promise<boolean> {
  // This would integrate with Clerk's organization permissions
  // For now, we'll use a simple check
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return false;
  }

  // In a real implementation, you'd check Clerk organization memberships
  // and their roles/permissions
  return true;
}