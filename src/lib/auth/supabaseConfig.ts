// Supabase authentication configuration

// Define protected routes
export const protectedRoutes = [
  '/dashboard',
  '/api/protected',
  '/api/github',
  '/api/inngest',
  '/projects'
];

// Define public routes that should be accessible without auth
export const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/help-center',
  '/api/webhooks', // GitHub webhooks need to be public
  '/docs', // Public documentation
];

export const supabaseConfig = {
  // Supabase URLs
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

  // Auth URLs
  signInUrl: '/auth/login',
  signUpUrl: '/auth/signup',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
};

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname.startsWith(route);
  });
}

export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname.startsWith(route);
  });
}
