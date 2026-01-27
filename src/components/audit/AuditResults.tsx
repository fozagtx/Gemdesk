'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Sparkles,
  Percent,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Loader2,
  Activity
} from 'lucide-react';

interface GemExecution {
  id: string;
  projectName: string;
  status: string;
  phase: string | null;
  startedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
}

interface AuditResultsProps {
  organizationName?: string;
  dateRange?: string;
  onBack?: () => void;
}

export function AuditResults({
  organizationName,
  dateRange,
  onBack
}: AuditResultsProps) {
  const [executions, setExecutions] = useState<GemExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'customer_questions' | 'product_releases'>('recommendations');

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    try {
      const response = await fetch('/api/executions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch executions');
      }
      
      const data = await response.json();
      setExecutions(data.executions || []);
    } catch (error) {
      console.error('Error fetching executions:', error);
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const completedExecutions = executions.filter(e => e.status === 'completed');
  const totalExecutions = executions.length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-medium text-gray-600">Audit</h1>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800">
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark as reviewed
        </Button>
      </div>

      {/* Gem Executions Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-purple-100 text-purple-700">
              💎
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-gray-900">Gem Execution Results</h2>
        </div>
        <p className="text-gray-600">
          View all Gem agent executions and their results across your projects
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalExecutions}</div>
                <div className="text-sm font-medium text-gray-900">Total Executions</div>
                <div className="text-sm text-gray-500">All Gem agent runs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{completedExecutions.length}</div>
                <div className="text-sm font-medium text-gray-900">Completed</div>
                <div className="text-sm text-gray-500">Successfully finished</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {totalExecutions > 0 ? Math.round((completedExecutions.length / totalExecutions) * 100) : 0}%
                </div>
                <div className="text-sm font-medium text-gray-900">Success Rate</div>
                <div className="text-sm text-gray-500">Completion percentage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Executions Yet</h3>
              <p className="text-muted-foreground">
                Gem agent executions will appear here once you connect repositories and trigger audits
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{execution.projectName}</h4>
                      <Badge 
                        variant={
                          execution.status === 'completed' ? 'default' :
                          execution.status === 'failed' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {execution.status}
                      </Badge>
                      {execution.phase && (
                        <Badge variant="outline">{execution.phase}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Started: {new Date(execution.startedAt).toLocaleString()}
                    </p>
                    {execution.errorMessage && (
                      <p className="text-sm text-red-600 mt-1">{execution.errorMessage}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-2" />
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}