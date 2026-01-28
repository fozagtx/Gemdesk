'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../src/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { GradientButton } from '../../src/components/ui/export-button';
import Header from '../../components/header/Header';
import { Footer } from '../../components/footer/Footer';
import { GitBranch, Users, Activity, Settings, Plus, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gemdesk Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user.email}</p>
          </div>
          <div className="flex gap-3">
            <GradientButton onClick={() => alert('Connect repository coming soon!')}>
              <Plus className="h-4 w-4 z-50" />
              <span className="text-[0.875rem] z-50">Connect Repository</span>
            </GradientButton>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No repositories connected yet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentation Files</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Ready for AI generation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gem Executions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                AI agent runs this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                You are the owner
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Gemdesk</CardTitle>
            <CardDescription>
              Get started by connecting your first GitHub repository to enable AI-powered documentation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-4">Gemdesk uses the Gem agent to automatically update your documentation when code changes. Here's how to get started:</p>

              <ol className="list-decimal list-inside space-y-2">
                <li>Connect a GitHub repository using the button above</li>
                <li>Configure your API keys (GitHub App, Google AI)</li>
                <li>Let the Gem agent analyze your codebase</li>
                <li>Watch as documentation updates automatically with code changes</li>
              </ol>
            </div>

            <div className="pt-4">
              <GradientButton onClick={() => alert('Repository connection wizard coming soon!')}>
                <GitBranch className="h-4 w-4 z-50" />
                <span className="text-[0.875rem] z-50">Get Started</span>
              </GradientButton>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
