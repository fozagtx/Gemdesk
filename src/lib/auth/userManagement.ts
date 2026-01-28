import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/database/connection';
import { users, organizations, organizationMembers, type NewUser, type NewOrganization } from '@/lib/database/schema';
import { eq, and } from 'drizzle-orm';

export interface UserWithOrg {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

export async function getCurrentUserWithOrg(): Promise<UserWithOrg | null> {
  const supabase = await createClient();
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

  if (error || !supabaseUser) {
    return null;
  }

  // Get or create user in database
  const dbUser = await getOrCreateUser(supabaseUser);

  // Get user's organization if they have one
  const membership = await db
    .select({
      organizationId: organizationMembers.organizationId,
    })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, dbUser.id))
    .limit(1);

  let organization;
  if (membership.length > 0) {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, membership[0].organizationId))
      .limit(1);

    if (org) {
      organization = {
        id: org.id,
        name: org.name,
        slug: org.slug,
      };
    }
  }

  return {
    ...dbUser,
    organization
  };
}

export async function getOrCreateUser(supabaseUser: any): Promise<{
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}> {
  const email = supabaseUser.email;

  if (!email) {
    throw new Error('User must have an email address');
  }

  // Check if user exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, supabaseUser.id))
    .limit(1);

  if (existingUser.length > 0) {
    // Update user info if needed
    const user = existingUser[0];
    const fullName = supabaseUser.user_metadata?.full_name || null;
    const avatarUrl = supabaseUser.user_metadata?.avatar_url || null;

    if (
      user.email !== email ||
      user.fullName !== fullName ||
      user.avatarUrl !== avatarUrl
    ) {
      await db
        .update(users)
        .set({
          email,
          fullName,
          avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return {
        ...user,
        email,
        fullName,
        avatarUrl,
      };
    }

    return user;
  }

  // Create new user
  const newUser: NewUser = {
    id: supabaseUser.id,
    email,
    fullName: supabaseUser.user_metadata?.full_name || null,
    avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
  };

  const created = await db
    .insert(users)
    .values(newUser)
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
  // Check if user is a member of the organization
  const membership = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId)
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return false;
  }

  // Check role-based permissions
  const role = membership[0].role;
  
  if (permission === 'read') {
    return true; // All members can read
  }
  
  if (permission === 'write') {
    return role === 'admin' || role === 'member';
  }
  
  if (permission === 'admin') {
    return role === 'admin' || role === 'owner';
  }

  return false;
}
