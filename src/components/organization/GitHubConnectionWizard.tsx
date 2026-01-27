'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
import { CheckCircle, Github, ExternalLink, GitBranch, FileText, Webhook } from 'lucide-react';

interface GitHubConnectionWizardProps {
  organizationId: string;
  onClose: () => void;
  onComplete: () => void;
}

interface Repository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  defaultBranch: string;
  language: string | null;
}

type WizardStep = 'install' | 'permissions' | 'repositories' | 'configure' | 'complete';

export function GitHubConnectionWizard({ organizationId, onClose, onComplete }: GitHubConnectionWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('install');
  const [progress, setProgress] = useState(20);
  const [selectedRepos, setSelectedRepos] = useState<Repository[]>([]);
  const [availableRepos, setAvailableRepos] = useState<Repository[]>([]);
  const [installationId, setInstallationId] = useState<number | null>(null);

  const steps = [
    { id: 'install', title: 'Install GitHub App', description: 'Install Gemdesk on your GitHub account' },
    { id: 'permissions', title: 'Grant Permissions', description: 'Allow Gemdesk to access your repositories' },
    { id: 'repositories', title: 'Select Repositories', description: 'Choose which repos to monitor' },
    { id: 'configure', title: 'Configure Settings', description: 'Set up documentation preferences' },
    { id: 'complete', title: 'Complete Setup', description: 'Finish the connection process' },
  ];

  const handleGitHubInstall = () => {
    // Redirect to GitHub App installation
    const installUrl = `https://github.com/apps/gemdesk/installations/new?suggested_target_id=${organizationId}`;
    window.open(installUrl, '_blank');

    // Simulate loading repositories after installation
    setTimeout(() => {
      setAvailableRepos([
        {
          id: 1,
          name: 'gemdesk-frontend',
          fullName: 'myorg/gemdesk-frontend',
          description: 'Main frontend application built with Next.js and TypeScript',
          private: false,
          defaultBranch: 'main',
          language: 'TypeScript'
        },
        {
          id: 2,
          name: 'api-server',
          fullName: 'myorg/api-server',
          description: 'Backend API server with authentication and documentation endpoints',
          private: true,
          defaultBranch: 'main',
          language: 'Node.js'
        },
        {
          id: 3,
          name: 'documentation',
          fullName: 'myorg/documentation',
          description: 'Product documentation and user guides',
          private: false,
          defaultBranch: 'main',
          language: 'Markdown'
        },
        {
          id: 4,
          name: 'mobile-app',
          fullName: 'myorg/mobile-app',
          description: 'React Native mobile application',
          private: true,
          defaultBranch: 'develop',
          language: 'React Native'
        },
        {
          id: 5,
          name: 'shared-components',
          fullName: 'myorg/shared-components',
          description: 'Shared UI components library used across projects',
          private: false,
          defaultBranch: 'main',
          language: 'TypeScript'
        }
      ]);
      setCurrentStep('repositories');
      setProgress(60);
    }, 2000);
  };

  const handleRepositoryToggle = (repo: Repository) => {
    setSelectedRepos(prev =>
      prev.find(r => r.id === repo.id)
        ? prev.filter(r => r.id !== repo.id)
        : [...prev, repo]
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'install':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Github className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Install Gemdesk GitHub App</h3>
              <p className="text-muted-foreground mb-6">
                We'll install the Gemdesk app on your GitHub account to monitor repository changes
                and automatically update your documentation.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Permissions Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Read repository contents</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GitBranch className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Create branches and pull requests</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Webhook className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Receive webhook notifications</span>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleGitHubInstall} className="w-full" size="lg">
              <Github className="h-4 w-4 mr-2" />
              Install on GitHub
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              You'll be redirected to GitHub to complete the installation
            </p>
          </div>
        );

      case 'permissions':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">App Installed Successfully!</h3>
              <p className="text-muted-foreground">
                Gemdesk can now access your repositories. Let's configure which ones to monitor.
              </p>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => {
                setCurrentStep('repositories');
                setProgress(60);
              }}>
                Continue to Repository Selection
              </Button>
            </div>
          </div>
        );

      case 'repositories':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Repositories</h3>
              <p className="text-muted-foreground mb-4">
                Choose which repositories Gemdesk should monitor for documentation updates.
              </p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableRepos.map((repo) => (
                <Card
                  key={repo.id}
                  className={`cursor-pointer transition-colors ${
                    selectedRepos.find(r => r.id === repo.id)
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleRepositoryToggle(repo)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{repo.name}</h4>
                          {repo.private && <Badge variant="secondary">Private</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {repo.description || 'No description'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Branch: {repo.defaultBranch}</span>
                          {repo.language && <span>Language: {repo.language}</span>}
                        </div>
                      </div>
                      {selectedRepos.find(r => r.id === repo.id) && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setCurrentStep('permissions');
                setProgress(40);
              }}>
                Back
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep('configure');
                  setProgress(80);
                }}
                disabled={selectedRepos.length === 0}
              >
                Continue ({selectedRepos.length} selected)
              </Button>
            </div>
          </div>
        );

      case 'configure':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Configure Documentation Settings</h3>
              <p className="text-muted-foreground mb-4">
                Set up how Gem should handle documentation for your {selectedRepos.length} selected repositories.
              </p>
            </div>

            {/* Selected Repositories Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected Repositories ({selectedRepos.length})</CardTitle>
                <CardDescription>
                  These repositories will be monitored for documentation updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedRepos.map((repo) => (
                    <div key={repo.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{repo.name}</span>
                        {repo.private && <Badge variant="secondary">Private</Badge>}
                      </div>
                      <span className="text-sm text-gray-500">{repo.language}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Documentation Template</CardTitle>
                  <CardDescription>
                    Choose the default template for new documentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <select className="w-full p-2 border rounded-md">
                    <option>API Documentation</option>
                    <option>Component Library</option>
                    <option>User Guide</option>
                    <option>Developer Documentation</option>
                  </select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Auto-merge Settings</CardTitle>
                  <CardDescription>
                    Configure when Gem should automatically merge documentation updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Auto-merge high-confidence updates (&gt;95%)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span className="text-sm">Auto-merge medium-confidence updates (&gt;80%)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Create PR for manual review</span>
                  </label>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setCurrentStep('repositories');
                setProgress(60);
              }}>
                Back
              </Button>
              <Button onClick={() => {
                setCurrentStep('complete');
                setProgress(100);
              }}>
                Complete Setup
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div>
              <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Setup Complete!</h3>
              <p className="text-muted-foreground">
                Gemdesk is now monitoring your selected repositories and will automatically
                update documentation when code changes are detected.
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3">What happens next?</h4>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Gem agent is now monitoring {selectedRepos.length} repositories</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Webhooks configured for real-time change detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Documentation updates will be created as pull requests</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={onComplete} size="lg" className="w-full">
              Go to Dashboard
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect GitHub Repository</DialogTitle>
          <DialogDescription>
            Set up Gemdesk to automatically manage your documentation
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={currentStep === step.id ? 'text-primary font-medium' : ''}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mt-6">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}