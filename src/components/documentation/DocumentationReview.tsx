'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText } from 'lucide-react';

interface DocumentCard {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'updated';
}

export function DocumentationReview() {
  const [documents, setDocuments] = useState<DocumentCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, show empty state since we don't have a documentation files API yet
    // In the future, this would fetch from /api/documentation
    setLoading(false);
    setDocuments([]);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Documentation Files</h3>
            <p className="text-muted-foreground text-center mb-4">
              Documentation files will appear here once Gem agent generates or updates them for your projects
            </p>
            <Button>Connect Repository</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Documentation Review</h2>
            <p className="text-muted-foreground">
              Review and publish documentation updates from Gem agent
            </p>
          </div>

          {/* Document Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {doc.status}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {doc.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <Button className="bg-gray-100 text-gray-700 hover:bg-gray-200">
              Review and publish
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
