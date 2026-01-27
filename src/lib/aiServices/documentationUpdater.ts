import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GeminiAgent } from './geminiAgent';

export interface DocumentationFile {
  path: string;
  content: string;
  frontmatter: Record<string, any>;
  lastModified: Date;
}

export interface UpdatePlan {
  files: DocumentationFile[];
  changes: Array<{
    filePath: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  screenshots: string[];
}

export class DocumentationUpdater {
  constructor(
    private geminiAgent: GeminiAgent,
    private docsPath: string = './docs'
  ) {}

  async scanDocumentationFiles(): Promise<DocumentationFile[]> {
    const files: DocumentationFile[] = [];
    const docsDir = path.resolve(this.docsPath);

    try {
      const entries = await fs.readdir(docsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.mdx')) {
          const filePath = path.join(docsDir, entry.name);
          const content = await fs.readFile(filePath, 'utf-8');
          const { data: frontmatter } = matter(content);
          const stats = await fs.stat(filePath);

          files.push({
            path: filePath,
            content,
            frontmatter,
            lastModified: stats.mtime
          });
        }
      }
    } catch (error) {
      console.error('Error scanning documentation files:', error);
    }

    return files;
  }

  async createUpdatePlan(codeChanges: string[]): Promise<UpdatePlan> {
    const documentationFiles = await this.scanDocumentationFiles();
    const plan: UpdatePlan = {
      files: documentationFiles,
      changes: [],
      screenshots: []
    };

    for (const change of codeChanges) {
      const thoughtSignature = await this.geminiAgent.analyzeCodebase();

      if (thoughtSignature.confidence > 0.7) {
        // Determine which files need updates
        const affectedFiles = this.determineAffectedFiles(change, documentationFiles);

        for (const file of affectedFiles) {
          plan.changes.push({
            filePath: file.path,
            reason: `Update required due to: ${change}`,
            priority: thoughtSignature.confidence > 0.9 ? 'high' : 'medium'
          });
        }
      }
    }

    return plan;
  }

  async executeUpdatePlan(plan: UpdatePlan): Promise<string[]> {
    const updatedFiles: string[] = [];

    for (const change of plan.changes) {
      try {
        const currentFile = plan.files.find(f => f.path === change.filePath);
        if (!currentFile) continue;

        const updatedContent = await this.geminiAgent.draftDocumentationUpdate(
          change.filePath,
          change.reason,
          currentFile.content
        );

        // Validate the update
        const validation = await this.geminiAgent.validateDocumentationUpdate(
          currentFile.content,
          updatedContent,
          change.reason
        );

        if (validation.isValid) {
          await this.writeDocumentationFile(change.filePath, updatedContent);
          updatedFiles.push(change.filePath);
        } else {
          console.warn(`Validation failed for ${change.filePath}:`, validation.suggestions);
        }
      } catch (error) {
        console.error(`Error updating ${change.filePath}:`, error);
      }
    }

    return updatedFiles;
  }

  private determineAffectedFiles(
    change: string,
    files: DocumentationFile[]
  ): DocumentationFile[] {
    // Simple heuristic - can be enhanced with more sophisticated matching
    const changeKeywords = change.toLowerCase().split(/\s+/);

    return files.filter(file => {
      const fileContent = file.content.toLowerCase();
      return changeKeywords.some(keyword => fileContent.includes(keyword));
    });
  }

  private async writeDocumentationFile(filePath: string, content: string): Promise<void> {
    const backupPath = `${filePath}.backup.${Date.now()}`;

    try {
      // Create backup
      const currentContent = await fs.readFile(filePath, 'utf-8');
      await fs.writeFile(backupPath, currentContent);

      // Write new content
      await fs.writeFile(filePath, content);
    } catch (error) {
      console.error(`Error writing documentation file ${filePath}:`, error);
      throw error;
    }
  }

  async createNewDocumentationFile(
    fileName: string,
    title: string,
    content: string,
    frontmatter: Record<string, any> = {}
  ): Promise<void> {
    const filePath = path.join(this.docsPath, `${fileName}.mdx`);

    const fullFrontmatter = {
      title,
      description: `Documentation for ${title}`,
      lastUpdated: new Date().toISOString(),
      ...frontmatter
    };

    const fileContent = matter.stringify(content, fullFrontmatter);

    await fs.writeFile(filePath, fileContent);
  }
}