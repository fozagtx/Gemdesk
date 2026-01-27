import { google } from '@ai-sdk/google';
import { generateObject, streamText } from 'ai';
import { z } from 'zod';
import { SimpleGit } from 'simple-git';

export const thoughtSignatureSchema = z.object({
  thought: z.string().describe('The agent\'s reasoning process'),
  action: z.string().describe('The next action to take'),
  confidence: z.number().min(0).max(1).describe('Confidence level in the decision'),
  requirements: z.array(z.string()).describe('Requirements for completing the action')
});

export type ThoughtSignature = z.infer<typeof thoughtSignatureSchema>;

export class GeminiAgent {
  private model = google('gemini-3.0-pro');
  private flashModel = google('gemini-3.0-flash');

  constructor(private git: SimpleGit) {}

  async analyzeCodebase(commitHash?: string): Promise<ThoughtSignature> {
    const diff = await this.git.diff(['HEAD~1', 'HEAD']);

    const { object } = await generateObject({
      model: this.model,
      schema: thoughtSignatureSchema,
      prompt: `
        Analyze this codebase diff and determine if documentation updates are needed:

        ${diff}

        Consider:
        - Function signature changes
        - New features or endpoints
        - UI component modifications
        - Configuration changes

        Provide your thought process and recommended action.
      `,
    });

    return object;
  }

  async draftDocumentationUpdate(
    filePath: string,
    changeDescription: string,
    currentContent?: string
  ): Promise<string> {
    const { textStream } = await streamText({
      model: this.flashModel,
      prompt: `
        Update the documentation file: ${filePath}

        Current content:
        ${currentContent || 'No existing content'}

        Changes needed:
        ${changeDescription}

        Generate updated MDX content that:
        1. Maintains existing structure
        2. Updates relevant sections
        3. Adds new information where needed
        4. Follows MDX best practices
        5. Includes proper React component usage
      `,
    });

    let updatedContent = '';
    for await (const delta of textStream) {
      updatedContent += delta;
    }

    return updatedContent;
  }

  async generateScreenshotInstructions(
    uiChanges: string[],
    stagingUrl: string
  ): Promise<string[]> {
    const { object } = await generateObject({
      model: this.flashModel,
      schema: z.object({
        instructions: z.array(z.string())
      }),
      prompt: `
        Generate Playwright instructions for capturing annotated screenshots:

        UI Changes:
        ${uiChanges.join('\n')}

        Staging URL: ${stagingUrl}

        Provide step-by-step instructions for capturing screenshots that highlight:
        1. New UI components
        2. Changed layouts
        3. Updated interactions
        4. Feature demonstrations
      `,
    });

    return object.instructions;
  }

  async validateDocumentationUpdate(
    originalContent: string,
    updatedContent: string,
    changeContext: string
  ): Promise<{ isValid: boolean; suggestions: string[] }> {
    const { object } = await generateObject({
      model: this.model,
      schema: z.object({
        isValid: z.boolean(),
        suggestions: z.array(z.string())
      }),
      prompt: `
        Validate this documentation update:

        Original:
        ${originalContent}

        Updated:
        ${updatedContent}

        Change context:
        ${changeContext}

        Check for:
        1. Accuracy of information
        2. Consistency with existing docs
        3. Clarity and readability
        4. Missing critical information
        5. Technical accuracy
      `,
    });

    return object;
  }
}