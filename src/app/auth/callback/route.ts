import { createClient } from '@/lib/supabase/server';
import { syncUserProfile } from '@/lib/auth/userSync';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      try {
        // Sync user profile to our database
        await syncUserProfile(data.user);

        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      } catch (syncError) {
        console.error('Error syncing user profile:', syncError);
        // Continue to redirect even if sync fails
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return to auth page with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}