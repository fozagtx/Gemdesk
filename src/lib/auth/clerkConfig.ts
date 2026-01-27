import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/protected(.*)',
  '/api/github(.*)',
  '/api/inngest(.*)',
  '/projects(.*)'
]);

// Define public routes that should be accessible without auth
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/help-center(.*)',
  '/api/webhooks(.*)', // GitHub webhooks need to be public
  '/docs(.*)', // Public documentation
]);

export const authMiddleware = clerkMiddleware((auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect routes
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const clerkConfig = {
  // Clerk configuration options
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  secretKey: process.env.CLERK_SECRET_KEY!,

  // Sign-in/up URLs
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',

  // Organization features
  organizationFeatures: {
    enabled: true,
    maxAllowedMemberships: 10,
    adminDeleteEnabled: true
  },

  // Multi-tenancy
  multiTenancy: {
    enabled: true,
    organizationProfileMode: 'navigation'
  }
};

export { isProtectedRoute, isPublicRoute };