'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, Users, Activity, Settings, Plus, Loader2 } from 'lucide-react';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  teamMembers: number;
  gemExecutions: number;
  organizationName: string;
  organizationImage?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">Error: {error}</p>
              <Button onClick={fetchDashboardStats} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Organization Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-600 rounded transform rotate-45 flex items-center justify-center">
              <span className="text-white text-xl font-bold transform -rotate-45">
                {stats?.organizationName?.[0] || 'G'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{stats?.organizationName || 'Gemdesk'}</h1>
              <p className="text-muted-foreground">
                {stats?.teamMembers || 0} members • {stats?.totalProjects || 0} projects
              </p>
            </div>
          </div>
          <Button className="space-x-2">
            <Plus className="h-4 w-4" />
            <span>Connect Repository</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                <GitBranch className="h-4 w-4 text-blue-600" fill="currentColor" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeProjects || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" fill="currentColor" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.teamMembers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gem Executions</CardTitle>
              <div className="h-8 w-8 rounded-md bg-purple-100 flex items-center justify-center">
                <Activity className="h-4 w-4 text-purple-600" fill="currentColor" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.gemExecutions || 0}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan</CardTitle>
              <div className="h-8 w-8 rounded-md bg-orange-100 flex items-center justify-center">
                <Settings className="h-4 w-4 text-orange-600" fill="currentColor" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Free</div>
              <p className="text-xs text-muted-foreground">
                Active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Content */}
        {stats && stats.totalProjects === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Gemdesk</CardTitle>
              <CardDescription>
                Your AI-powered documentation assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Connect your GitHub repositories to start automating your documentation
                with our AI agent. Navigate using the sidebar to explore different features.
              </p>
              <div className="flex space-x-4">
                <Button>Connect GitHub</Button>
                <Button variant="outline">View Documentation</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
