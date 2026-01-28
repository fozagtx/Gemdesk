import { createClient } from '@/lib/supabase/server';
import { createSupabaseClient } from '@/lib/database';
import type { User } from '@supabase/supabase-js';

export async function syncUserProfile(authUser: User) {
  try {
    const supabaseClient = createSupabaseClient();

    const userData = {
      id: authUser.id,
      email: authUser.email!,
      full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
      avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
      updated_at: new Date().toISOString(),
    };

    // Use Supabase upsert to insert or update user
    const { error } = await supabaseClient
      .from('users')
      .upsert({
        ...userData,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error upserting user:', error);
      throw error;
    }

    return userData;
  } catch (error) {
    console.error('Error syncing user profile:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Sync user profile to our database
  await syncUserProfile(user);

  // Return user data from our database
  const supabaseClient = createSupabaseClient();
  const { data: userData, error: fetchError } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (fetchError) {
    console.error('Error fetching user data:', fetchError);
    return null;
  }

  return userData;
}