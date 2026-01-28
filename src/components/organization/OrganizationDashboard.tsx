'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GitBranch, Users, Settings, Plus, Activity } from 'lucide-react';
import { GitHubConnectionWizard } from './GitHubConnectionWizard';
import { GradientButton } from '@/components/ui/export-button';
import { ProjectList } from './ProjectList';
import { MemberManagement } from './MemberManagement';
import { AuditResults } from '@/components/audit/AuditResults';

interface OrganizationStats {
  totalProjects: number;
  activeProjects: number;
  totalMembers: number;
  gemExecutions: number;
}

export function OrganizationDashboard() {
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showGitHubWizard, setShowGitHubWizard] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'audit'>('dashboard');
  const [stats, setStats] = useState<OrganizationStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalMembers: 0,
    gemExecutions: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Get user's organizations (simplified - get first one for now)
        // In a real app, you'd have proper organization selection
        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('organizations(*)')
          .eq('user_id', user.id)
          .single();

        if (orgMember?.organizations) {
          setOrganization(orgMember.organizations);
        }
      }
      setLoading(false);
    };

    getUser();
  }, [supabase]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 p-6">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Not Authenticated</CardTitle>
              <CardDescription>
                Please sign in to access Gemdesk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/auth/login'}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!organization) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 p-6">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>No Organization</CardTitle>
              <CardDescription>
                You need to be part of an organization to use Gemdesk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/dashboard/organizations'}>
                Create or Join Organization
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (currentView === 'audit') {
    return (
      <DashboardLayout>
        <AuditResults onBack={() => setCurrentView('dashboard')} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Organization Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={organization.avatarUrl} alt={organization.name} />
            <AvatarFallback>
              {organization.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground">
              {stats.totalMembers} member{stats.totalMembers !== 1 ? 's' : ''} • {stats.totalProjects} project{stats.totalProjects !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <GradientButton onClick={() => setShowGitHubWizard(true)}>
          <Plus className="h-4 w-4 z-50" />
          <span className="text-[0.875rem] z-50">Connect Repository</span>
        </GradientButton>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gem Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gemExecutions}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Pro</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary">Active</Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <ProjectList organizationId={organization.id} />
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <MemberManagement organizationId={organization.id} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization preferences and configuration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Organization Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md mt-1"
                    defaultValue={organization.name}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Default Documentation Template</label>
                  <select className="w-full p-2 border rounded-md mt-1">
                    <option>API Documentation</option>
                    <option>Component Library</option>
                    <option>User Guide</option>
                    <option>Custom</option>
                  </select>
                </div>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest Gem executions and documentation updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Latest Audit Available</p>
                    <p className="text-xs text-gray-600">79 recommendations found from recent conversations</p>
                  </div>
                  <GradientButton onClick={() => setCurrentView('audit')}>
                    <Activity className="h-4 w-4 z-50" />
                    <span className="text-[0.875rem] z-50">View Audit</span>
                  </GradientButton>
                </div>
                <div className="text-center text-muted-foreground py-8">
                  No recent activity. Connect a repository to get started.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* GitHub Connection Wizard Modal */}
      {showGitHubWizard && (
        <GitHubConnectionWizard
          organizationId={organization.id}
          onClose={() => setShowGitHubWizard(false)}
          onComplete={() => {
            setShowGitHubWizard(false);
            // Refresh data
          }}
        />
      )}
      </div>
    </DashboardLayout>
  );
}