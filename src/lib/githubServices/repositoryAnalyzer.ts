import { simpleGit, SimpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';

export interface RepositoryInfo {
  owner: string;
  name: string;
  branch: string;
  lastCommit: string;
  structure: FileNode[];
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
  content?: string;
}

export interface AnalysisResult {
  framework: string | null;
  language: string;
  hasTests: boolean;
  hasDocumentation: boolean;
  apiEndpoints: string[];
  components: string[];
  dependencies: Record<string, string>;
}

export class RepositoryAnalyzer {
  private git: SimpleGit;
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  async cloneRepository(cloneUrl: string, accessToken: string): Promise<void> {
    // Clone repository with access token
    const authenticatedUrl = this.addTokenToUrl(cloneUrl, accessToken);
    await this.git.clone(authenticatedUrl, this.repoPath);
  }

  async analyzeRepository(): Promise<AnalysisResult> {
    const packageJson = await this.findPackageJson();
    const tsConfig = await this.findTsConfig();
    const framework = await this.detectFramework();

    return {
      framework,
      language: tsConfig ? 'typescript' : 'javascript',
      hasTests: await this.hasTestFiles(),
      hasDocumentation: await this.hasDocumentationFiles(),
      apiEndpoints: await this.findApiEndpoints(),
      components: await this.findComponents(),
      dependencies: packageJson?.dependencies || {}
    };
  }

  async getRepositoryStructure(): Promise<FileNode[]> {
    return await this.buildFileTree(this.repoPath);
  }

  async getFileContent(filePath: string): Promise<string> {
    const fullPath = path.join(this.repoPath, filePath);
    try {
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return '';
    }
  }

  async findChangedFiles(since?: string): Promise<string[]> {
    try {
      const diff = await this.git.diff(['--name-only', since || 'HEAD~1']);
      return diff.split('\n').filter(file => file.trim().length > 0);
    } catch (error) {
      console.error('Error finding changed files:', error);
      return [];
    }
  }

  async getCommitHistory(limit: number = 10): Promise<Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>> {
    try {
      const log = await this.git.log({ maxCount: limit });
      return log.all.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: commit.date
      }));
    } catch (error) {
      console.error('Error getting commit history:', error);
      return [];
    }
  }

  private async buildFileTree(dirPath: string, relativePath: string = ''): Promise<FileNode[]> {
    const nodes: FileNode[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);
        const entryRelativePath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          const children = await this.buildFileTree(fullPath, entryRelativePath);
          nodes.push({
            name: entry.name,
            path: entryRelativePath,
            type: 'directory',
            children
          });
        } else {
          const stats = await fs.stat(fullPath);
          nodes.push({
            name: entry.name,
            path: entryRelativePath,
            type: 'file',
            size: stats.size
          });
        }
      }
    } catch (error) {
      console.error(`Error building file tree for ${dirPath}:`, error);
    }

    return nodes.sort((a, b) => {
      // Directories first, then files
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private async findPackageJson(): Promise<any> {
    try {
      const packageJsonPath = path.join(this.repoPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private async findTsConfig(): Promise<boolean> {
    try {
      await fs.access(path.join(this.repoPath, 'tsconfig.json'));
      return true;
    } catch {
      return false;
    }
  }

  private async detectFramework(): Promise<string | null> {
    const packageJson = await this.findPackageJson();
    if (!packageJson?.dependencies) return null;

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.next) return 'Next.js';
    if (deps.react) return 'React';
    if (deps.vue) return 'Vue.js';
    if (deps.angular || deps['@angular/core']) return 'Angular';
    if (deps.express) return 'Express';
    if (deps.fastify) return 'Fastify';
    if (deps.nuxt) return 'Nuxt.js';

    return null;
  }

  private async hasTestFiles(): Promise<boolean> {
    try {
      const testPatterns = [
        '**/*.test.*',
        '**/*.spec.*',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**'
      ];

      for (const pattern of testPatterns) {
        const files = await this.findFilesByPattern(pattern);
        if (files.length > 0) return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private async hasDocumentationFiles(): Promise<boolean> {
    try {
      const docPatterns = [
        '**/README.md',
        '**/docs/**',
        '**/*.mdx',
        '**/CHANGELOG.md'
      ];

      for (const pattern of docPatterns) {
        const files = await this.findFilesByPattern(pattern);
        if (files.length > 0) return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private async findApiEndpoints(): Promise<string[]> {
    const endpoints: string[] = [];

    try {
      // Look for Next.js API routes
      const apiFiles = await this.findFilesByPattern('**/api/**/*.{js,ts}');
      endpoints.push(...apiFiles.map(file => file.replace(/\.(js|ts)$/, '')));

      // Look for Express routes (basic pattern)
      const routeFiles = await this.findFilesByPattern('**/routes/**/*.{js,ts}');
      endpoints.push(...routeFiles);

    } catch (error) {
      console.error('Error finding API endpoints:', error);
    }

    return endpoints;
  }

  private async findComponents(): Promise<string[]> {
    const components: string[] = [];

    try {
      const componentPatterns = [
        '**/components/**/*.{js,ts,jsx,tsx}',
        '**/src/components/**/*.{js,ts,jsx,tsx}'
      ];

      for (const pattern of componentPatterns) {
        const files = await this.findFilesByPattern(pattern);
        components.push(...files);
      }
    } catch (error) {
      console.error('Error finding components:', error);
    }

    return components;
  }

  private async findFilesByPattern(pattern: string): Promise<string[]> {
    // Simple file pattern matching - in production, use a proper glob library
    const allFiles = await this.getAllFiles(this.repoPath);
    const regex = this.patternToRegex(pattern);
    return allFiles.filter(file => regex.test(file));
  }

  private async getAllFiles(dir: string, files: string[] = []): Promise<string[]> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await this.getAllFiles(fullPath, files);
        } else {
          files.push(path.relative(this.repoPath, fullPath));
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }

    return files;
  }

  private patternToRegex(pattern: string): RegExp {
    // Convert glob pattern to regex (simplified)
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\./g, '\\.');

    return new RegExp(`^${regexPattern}$`);
  }

  private addTokenToUrl(url: string, token: string): string {
    const urlObj = new URL(url);
    urlObj.username = token;
    return urlObj.toString();
  }
}