'use client';

import { useState } from 'react';
import { createClient } from '../../../src/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async () => {
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          setMessage(error.message);
        } else {
          setMessage('Check your email for the confirmation link!');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setMessage(error.message);
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setMessage(error.message);
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Card className="w-96 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome to Gemdesk</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {message && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {message}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleAuth}
            disabled={loading || !email || !password}
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGitHubAuth}
            disabled={loading}
          >
            Continue with GitHub
          </Button>

          <div className="text-center text-sm">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setIsSignUp(false)}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setIsSignUp(true)}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}