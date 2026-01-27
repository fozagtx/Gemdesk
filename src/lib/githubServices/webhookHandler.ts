import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';

const githubWebhookSchema = z.object({
  action: z.string(),
  repository: z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    clone_url: z.string(),
    default_branch: z.string()
  }),
  commits: z.array(z.object({
    id: z.string(),
    message: z.string(),
    author: z.object({
      name: z.string(),
      email: z.string()
    }),
    added: z.array(z.string()),
    removed: z.array(z.string()),
    modified: z.array(z.string())
  })).optional(),
  installation: z.object({
    id: z.number()
  }).optional()
});

export type GitHubWebhookPayload = z.infer<typeof githubWebhookSchema>;

export class WebhookHandler {
  private secret: string;

  constructor(secret?: string) {
    this.secret = secret || process.env.GITHUB_WEBHOOK_SECRET || '';
  }

  validateSignature(payload: string, signature: string): boolean {
    if (!this.secret) {
      console.warn('No GitHub webhook secret configured');
      return true; // Allow in development
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');

    const providedSignature = signature.replace('sha256=', '');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  }

  async handleWebhook(request: NextRequest): Promise<NextResponse> {
    try {
      const payload = await request.text();
      const signature = request.headers.get('x-hub-signature-256') || '';
      const event = request.headers.get('x-github-event') || '';

      // Validate signature
      if (!this.validateSignature(payload, signature)) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }

      const data = JSON.parse(payload);
      const validatedData = githubWebhookSchema.parse(data);

      // Route to appropriate handler
      switch (event) {
        case 'push':
          return await this.handlePushEvent(validatedData);
        case 'installation':
          return await this.handleInstallationEvent(validatedData);
        case 'pull_request':
          return await this.handlePullRequestEvent(validatedData);
        default:
          return NextResponse.json(
            { message: 'Event not handled' },
            { status: 200 }
          );
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  private async handlePushEvent(payload: GitHubWebhookPayload): Promise<NextResponse> {
    console.log('Push event received:', {
      repository: payload.repository.full_name,
      commits: payload.commits?.length || 0
    });

    // Trigger documentation update workflow
    if (payload.commits && payload.commits.length > 0) {
      await this.triggerDocumentationUpdate(payload);
    }

    return NextResponse.json({ message: 'Push event processed' });
  }

  private async handleInstallationEvent(payload: GitHubWebhookPayload): Promise<NextResponse> {
    console.log('Installation event received:', {
      action: payload.action,
      installation: payload.installation?.id
    });

    // Store installation data in database
    if (payload.installation) {
      await this.storeInstallation(payload);
    }

    return NextResponse.json({ message: 'Installation event processed' });
  }

  private async handlePullRequestEvent(payload: GitHubWebhookPayload): Promise<NextResponse> {
    console.log('Pull request event received:', {
      action: payload.action,
      repository: payload.repository.full_name
    });

    // Handle PR events (e.g., auto-merge documentation updates)
    if (payload.action === 'opened' || payload.action === 'synchronize') {
      await this.processPullRequest(payload);
    }

    return NextResponse.json({ message: 'Pull request event processed' });
  }

  private async triggerDocumentationUpdate(payload: GitHubWebhookPayload): Promise<void> {
    // This would typically trigger an Inngest event or background job
    const changes = payload.commits?.flatMap(commit => [
      ...commit.added,
      ...commit.modified,
      ...commit.removed
    ]) || [];

    console.log('Changes detected:', changes);

    // For now, just log the changes
    // In production, this would trigger the Gem agent workflow
  }

  private async storeInstallation(payload: GitHubWebhookPayload): Promise<void> {
    // Store installation data in database
    // This would use Drizzle ORM to insert installation records
    console.log('Storing installation:', payload.installation?.id);
  }

  private async processPullRequest(payload: GitHubWebhookPayload): Promise<void> {
    // Process pull request
    // Check if it's an auto-generated documentation update
    // Potentially auto-approve and merge if validation passes
    console.log('Processing pull request for:', payload.repository.full_name);
  }
}

// Utility functions for webhook processing
export function extractChangedFiles(commits: GitHubWebhookPayload['commits']): string[] {
  if (!commits) return [];

  return commits.flatMap(commit => [
    ...commit.added,
    ...commit.modified
  ]);
}

export function isDocumentationChange(changedFiles: string[]): boolean {
  const docPatterns = [
    /\.md$/,
    /\.mdx$/,
    /\/docs\//,
    /\/documentation\//,
    /README/i
  ];

  return changedFiles.some(file =>
    docPatterns.some(pattern => pattern.test(file))
  );
}

export function extractCodeChanges(commits: GitHubWebhookPayload['commits']): Array<{
  type: 'added' | 'modified' | 'removed';
  files: string[];
  message: string;
}> {
  if (!commits) return [];

  return commits.map(commit => ({
    type: 'modified',
    files: [...commit.added, ...commit.modified, ...commit.removed],
    message: commit.message
  }));
}