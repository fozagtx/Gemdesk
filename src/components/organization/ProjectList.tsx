'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GitBranch,
  FileText,
  Activity,
  Calendar,
  MoreVertical,
  ExternalLink,
  Settings,
  Pause,
  Play,
  Trash2
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  repositoryFullName: string;
  repositoryId: number;
  defaultBranch: string;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
  gemExecutions: number;
  documentationFiles: number;
}

interface ProjectListProps {
  organizationId: string;
}

export function ProjectList({ organizationId }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [organizationId]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleProjectStatus = async (projectId: string, isActive: boolean) => {
    try {
      // Call API to update project status
      // await fetch(`/api/projects/${projectId}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ isActive: !isActive })
      // });

      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? { ...project, isActive: !isActive }
            : project
        )
      );
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getRepositoryUrl = (fullName: string) => {
    return `https://github.com/${fullName}`;
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Projects Connected</h3>
          <p className="text-muted-foreground text-center mb-4">
            Connect your first GitHub repository to start using Gemdesk's autonomous documentation.
          </p>
          <Button>Connect Repository</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Connected Projects</h2>
        <div className="text-sm text-muted-foreground">
          {projects.filter(p => p.isActive).length} active • {projects.length} total
        </div>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={project.isActive ? 'default' : 'secondary'}>
                      {project.isActive ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center space-x-2">
                    <GitBranch className="h-3 w-3" />
                    <span>{project.repositoryFullName}</span>
                    <span>•</span>
                    <span>{project.defaultBranch}</span>
                  </CardDescription>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {project.description}
                    </p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.open(getRepositoryUrl(project.repositoryFullName), '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on GitHub
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleProjectStatus(project.id, project.isActive)}>
                      {project.isActive ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Monitoring
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume Monitoring
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{project.documentationFiles}</div>
                    <div className="text-muted-foreground">Docs</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{project.gemExecutions}</div>
                    <div className="text-muted-foreground">Gem runs</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{formatDate(project.lastSyncAt)}</div>
                    <div className="text-muted-foreground">Last sync</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${project.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <div className="font-medium">{project.isActive ? 'Monitoring' : 'Paused'}</div>
                    <div className="text-muted-foreground">Status</div>
                  </div>
                </div>
              </div>

              {project.isActive && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      View Docs
                    </Button>
                    <Button variant="outline" size="sm">
                      <Activity className="h-3 w-3 mr-1" />
                      Activity Log
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}