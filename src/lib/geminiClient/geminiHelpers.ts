import { generateObject, generateText, streamText } from 'ai';
import { z } from 'zod';
import { geminiModels, geminiConfig, systemPrompts, GeminiError } from './geminiConfig';

// Schemas for structured outputs
export const thoughtSignatureSchema = z.object({
  thought: z.string().describe('The agent\'s reasoning process'),
  action: z.string().describe('The next action to take'),
  confidence: z.number().min(0).max(1).describe('Confidence level in the decision'),
  requirements: z.array(z.string()).describe('Requirements for completing the action'),
  priority: z.enum(['low', 'medium', 'high']).describe('Priority level'),
});

export const documentationUpdateSchema = z.object({
  filePath: z.string(),
  title: z.string(),
  content: z.string(),
  frontmatter: z.record(z.any()).optional(),
  reason: z.string(),
  changeType: z.enum(['create', 'update', 'delete']),
});

export const screenshotInstructionSchema = z.object({
  instructions: z.array(z.object({
    step: z.number(),
    action: z.string(),
    url: z.string().optional(),
    selector: z.string().optional(),
    description: z.string(),
    annotations: z.array(z.object({
      x: z.number(),
      y: z.number(),
      text: z.string(),
      type: z.enum(['callout', 'highlight', 'arrow']),
    })).optional(),
  })),
});

// Type exports
export type ThoughtSignature = z.infer<typeof thoughtSignatureSchema>;
export type DocumentationUpdate = z.infer<typeof documentationUpdateSchema>;
export type ScreenshotInstruction = z.infer<typeof screenshotInstructionSchema>;

// Helper class for Gemini interactions
export class GeminiHelper {

  // Generate thought signature for decision making
  static async generateThoughtSignature(
    prompt: string,
    context?: Record<string, any>
  ): Promise<ThoughtSignature> {
    try {
      const { object } = await generateObject({
        model: geminiModels.pro,
        schema: thoughtSignatureSchema,
        system: systemPrompts.gemAgent,
        prompt: `
          Context: ${JSON.stringify(context, null, 2)}

          Task: ${prompt}

          Analyze this situation and provide your thought process, recommended action,
          confidence level, requirements, and priority.
        `,
        ...geminiConfig.autonomous,
      });

      return object;
    } catch (error) {
      throw new GeminiError('Failed to generate thought signature', 'THOUGHT_GENERATION_ERROR', error);
    }
  }

  // Generate documentation content
  static async generateDocumentation(
    prompt: string,
    currentContent?: string,
    context?: Record<string, any>
  ): Promise<DocumentationUpdate> {
    try {
      const { object } = await generateObject({
        model: geminiModels.pro,
        schema: documentationUpdateSchema,
        system: systemPrompts.gemAgent,
        prompt: `
          Current documentation:
          ${currentContent || 'No existing content'}

          Context:
          ${JSON.stringify(context, null, 2)}

          Task: ${prompt}

          Generate updated documentation that:
          1. Maintains existing structure when possible
          2. Uses proper MDX syntax
          3. Includes appropriate frontmatter
          4. Follows documentation best practices
          5. Is clear and user-friendly
        `,
        ...geminiConfig.documentation,
      });

      return object;
    } catch (error) {
      throw new GeminiError('Failed to generate documentation', 'DOCUMENTATION_GENERATION_ERROR', error);
    }
  }

  // Generate screenshot instructions
  static async generateScreenshotInstructions(
    uiChanges: string[],
    stagingUrl: string,
    context?: Record<string, any>
  ): Promise<ScreenshotInstruction> {
    try {
      const { object } = await generateObject({
        model: geminiModels.flash,
        schema: screenshotInstructionSchema,
        system: systemPrompts.screenshotAnalyzer,
        prompt: `
          UI Changes:
          ${uiChanges.map((change, i) => `${i + 1}. ${change}`).join('\n')}

          Staging URL: ${stagingUrl}

          Context:
          ${JSON.stringify(context, null, 2)}

          Generate step-by-step screenshot instructions that:
          1. Cover all UI changes
          2. Include proper selectors
          3. Suggest helpful annotations
          4. Follow a logical sequence
          5. Highlight key features
        `,
        ...geminiConfig.autonomous,
      });

      return object;
    } catch (error) {
      throw new GeminiError('Failed to generate screenshot instructions', 'SCREENSHOT_GENERATION_ERROR', error);
    }
  }

  // Stream text for interactive responses
  static async streamResponse(
    prompt: string,
    systemPrompt?: string,
    useFlash: boolean = true
  ) {
    try {
      return await streamText({
        model: useFlash ? geminiModels.flash : geminiModels.pro,
        system: systemPrompt || systemPrompts.helpCenterAgent,
        prompt,
        ...geminiConfig.interactive,
      });
    } catch (error) {
      throw new GeminiError('Failed to stream response', 'STREAM_ERROR', error);
    }
  }

  // Generate simple text response
  static async generateResponse(
    prompt: string,
    systemPrompt?: string,
    useFlash: boolean = false
  ): Promise<string> {
    try {
      const { text } = await generateText({
        model: useFlash ? geminiModels.flash : geminiModels.pro,
        system: systemPrompt || systemPrompts.helpCenterAgent,
        prompt,
        ...geminiConfig.interactive,
      });

      return text;
    } catch (error) {
      throw new GeminiError('Failed to generate response', 'TEXT_GENERATION_ERROR', error);
    }
  }

  // Analyze code changes
  static async analyzeCodeChanges(
    changes: Array<{
      filePath: string;
      content: string;
      changeType: 'added' | 'modified' | 'deleted';
    }>
  ): Promise<{
    documentationNeeded: boolean;
    suggestedUpdates: string[];
    priority: 'low' | 'medium' | 'high';
    affectedAreas: string[];
  }> {
    try {
      const analysisPrompt = `
        Analyze these code changes and determine if documentation updates are needed:

        ${changes.map(change => `
          File: ${change.filePath}
          Type: ${change.changeType}
          Content: ${change.content.slice(0, 1000)}...
        `).join('\n---\n')}

        Consider:
        - API changes (new endpoints, modified responses)
        - UI changes (new components, modified interfaces)
        - Breaking changes
        - New features
        - Configuration changes
      `;

      const result = await generateObject({
        model: geminiModels.pro,
        schema: z.object({
          documentationNeeded: z.boolean(),
          suggestedUpdates: z.array(z.string()),
          priority: z.enum(['low', 'medium', 'high']),
          affectedAreas: z.array(z.string()),
        }),
        system: systemPrompts.gemAgent,
        prompt: analysisPrompt,
        ...geminiConfig.autonomous,
      });

      return result.object;
    } catch (error) {
      throw new GeminiError('Failed to analyze code changes', 'CODE_ANALYSIS_ERROR', error);
    }
  }

  // Validate documentation quality
  static async validateDocumentation(
    content: string,
    context: {
      filePath: string;
      changeDescription: string;
    }
  ): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
    score: number;
  }> {
    try {
      const validationPrompt = `
        Validate this documentation content:

        File: ${context.filePath}
        Context: ${context.changeDescription}

        Content:
        ${content}

        Check for:
        1. Accuracy of information
        2. Clarity and readability
        3. Proper MDX syntax
        4. Complete frontmatter
        5. Helpful examples
        6. Consistent style
        7. User-friendly language
      `;

      const result = await generateObject({
        model: geminiModels.pro,
        schema: z.object({
          isValid: z.boolean(),
          issues: z.array(z.string()),
          suggestions: z.array(z.string()),
          score: z.number().min(0).max(100),
        }),
        system: systemPrompts.gemAgent,
        prompt: validationPrompt,
        ...geminiConfig.documentation,
      });

      return result.object;
    } catch (error) {
      throw new GeminiError('Failed to validate documentation', 'VALIDATION_ERROR', error);
    }
  }
}