import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import crypto from 'crypto';

export interface GitHubAppConfig {
  appId: string;
  privateKey: string;
  clientId: string;
  clientSecret: string;
  webhookSecret: string;
}

export class GitHubApp {
  private octokit: Octokit;
  private config: GitHubAppConfig;

  constructor(config: GitHubAppConfig) {
    this.config = config;

    // Initialize Octokit with App authentication
    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: config.appId,
        privateKey: config.privateKey,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      },
    });
  }

  // Get installation access token
  async getInstallationAccessToken(installationId: number): Promise<string> {
    try {
      const { data } = await this.octokit.rest.apps.createInstallationAccessToken({
        installation_id: installationId,
      });

      return data.token;
    } catch (error) {
      console.error('Error getting installation access token:', error);
      throw new Error('Failed to get installation access token');
    }
  }

  // Get installation repositories
  async getInstallationRepositories(installationId: number): Promise<Array<{
    id: number;
    name: string;
    fullName: string;
    cloneUrl: string;
    defaultBranch: string;
    description: string | null;
    private: boolean;
  }>> {
    try {
      const token = await this.getInstallationAccessToken(installationId);
      const authenticatedOctokit = new Octokit({ auth: token });

      const { data } = await authenticatedOctokit.rest.apps.listReposAccessibleToInstallation();

      return data.repositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        cloneUrl: repo.clone_url,
        defaultBranch: repo.default_branch,
        description: repo.description,
        private: repo.private,
      }));
    } catch (error) {
      console.error('Error getting installation repositories:', error);
      throw new Error('Failed to get installation repositories');
    }
  }

  // Create a pull request
  async createPullRequest(
    installationId: number,
    owner: string,
    repo: string,
    options: {
      title: string;
      body: string;
      head: string;
      base: string;
    }
  ): Promise<{ number: number; url: string }> {
    try {
      const token = await this.getInstallationAccessToken(installationId);
      const authenticatedOctokit = new Octokit({ auth: token });

      const { data } = await authenticatedOctokit.rest.pulls.create({
        owner,
        repo,
        title: options.title,
        body: options.body,
        head: options.head,
        base: options.base,
      });

      return {
        number: data.number,
        url: data.html_url,
      };
    } catch (error) {
      console.error('Error creating pull request:', error);
      throw new Error('Failed to create pull request');
    }
  }

  // Get file content
  async getFileContent(
    installationId: number,
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<{ content: string; sha: string }> {
    try {
      const token = await this.getInstallationAccessToken(installationId);
      const authenticatedOctokit = new Octokit({ auth: token });

      const { data } = await authenticatedOctokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if ('content' in data && data.content) {
        return {
          content: Buffer.from(data.content, 'base64').toString('utf-8'),
          sha: data.sha,
        };
      }

      throw new Error('File content not found');
    } catch (error) {
      console.error('Error getting file content:', error);
      throw new Error('Failed to get file content');
    }
  }

  // Update file content
  async updateFileContent(
    installationId: number,
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string,
    branch?: string
  ): Promise<{ sha: string; url: string }> {
    try {
      const token = await this.getInstallationAccessToken(installationId);
      const authenticatedOctokit = new Octokit({ auth: token });

      const { data } = await authenticatedOctokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        sha,
        branch,
      });

      return {
        sha: data.content?.sha || '',
        url: data.content?.html_url || '',
      };
    } catch (error) {
      console.error('Error updating file content:', error);
      throw new Error('Failed to update file content');
    }
  }

  // Create a branch
  async createBranch(
    installationId: number,
    owner: string,
    repo: string,
    branchName: string,
    fromBranch: string = 'main'
  ): Promise<string> {
    try {
      const token = await this.getInstallationAccessToken(installationId);
      const authenticatedOctokit = new Octokit({ auth: token });

      // Get the SHA of the base branch
      const { data: refData } = await authenticatedOctokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${fromBranch}`,
      });

      const sha = refData.object.sha;

      // Create the new branch
      await authenticatedOctokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha,
      });

      return branchName;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw new Error('Failed to create branch');
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      console.warn('No webhook secret configured');
      return true; // Allow in development
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex');

    const providedSignature = signature.replace('sha256=', '');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  }

  // Get installation info
  async getInstallation(installationId: number): Promise<{
    id: number;
    account: {
      login: string;
      type: string;
    };
    permissions: Record<string, string>;
  }> {
    try {
      const { data } = await this.octokit.rest.apps.getInstallation({
        installation_id: installationId,
      });

      const account = data.account as any;

      return {
        id: data.id,
        account: {
          login: account?.login || account?.name || '',
          type: account?.type || '',
        },
        permissions: data.permissions as Record<string, string>,
      };
    } catch (error) {
      console.error('Error getting installation:', error);
      throw new Error('Failed to get installation');
    }
  }

  // List commits for comparison
  async compareCommits(
    installationId: number,
    owner: string,
    repo: string,
    base: string,
    head: string
  ): Promise<Array<{
    sha: string;
    message: string;
    author: string;
    files: Array<{
      filename: string;
      status: string;
      additions: number;
      deletions: number;
    }>;
  }>> {
    try {
      const token = await this.getInstallationAccessToken(installationId);
      const authenticatedOctokit = new Octokit({ auth: token });

      const { data } = await authenticatedOctokit.rest.repos.compareCommits({
        owner,
        repo,
        base,
        head,
      });

      return data.commits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name || 'Unknown',
        files: data.files?.map(file => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
        })) || [],
      }));
    } catch (error) {
      console.error('Error comparing commits:', error);
      throw new Error('Failed to compare commits');
    }
  }
}

// Create singleton instance
export function createGitHubApp(): GitHubApp {
  const config: GitHubAppConfig = {
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET!,
  };

  return new GitHubApp(config);
}