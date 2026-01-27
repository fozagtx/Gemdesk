import { google } from '@ai-sdk/google';

// Model configurations
export const geminiModels = {
  pro: google('gemini-3.0-pro', {
    // Model-specific settings
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  }),
  flash: google('gemini-3.0-flash', {
    // Flash model for faster responses
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  }),
};

// Default system prompts
export const systemPrompts = {
  gemAgent: `You are Gem, an AI agent specialized in autonomous documentation updates.

Your capabilities:
- Analyze code changes and identify documentation gaps
- Generate high-quality MDX documentation
- Create thoughtful commit messages and pull requests
- Maintain consistency across documentation files
- Generate screenshot instructions for UI changes

Always:
- Use clear, concise language
- Follow MDX best practices
- Include proper frontmatter
- Consider the user's perspective
- Provide actionable information

When analyzing code:
- Focus on user-facing changes
- Identify breaking changes
- Consider backwards compatibility
- Look for new features or endpoints`,

  helpCenterAgent: `You are a helpful AI assistant for Gemdesk's help center.

Your role:
- Answer questions about the connected repositories
- Help users navigate documentation
- Provide code examples and explanations
- Guide users through features and functionality

Always:
- Be friendly and professional
- Provide accurate information
- Include relevant code examples
- Link to appropriate documentation sections
- Ask clarifying questions when needed`,

  screenshotAnalyzer: `You are an AI specialized in analyzing UI screenshots for documentation.

Your capabilities:
- Identify UI elements and their purposes
- Generate descriptive captions
- Suggest annotation placements
- Describe user workflows
- Compare before/after states

When analyzing screenshots:
- Focus on key functionality
- Use clear, descriptive language
- Identify important user interface elements
- Suggest helpful annotations
- Consider the user's learning journey`,
};

// Tool definitions for function calling
export const geminiTools = {
  auditCodebase: {
    description: 'Analyze codebase changes for documentation updates',
    parameters: {
      type: 'object',
      properties: {
        commitHash: {
          type: 'string',
          description: 'Git commit hash to analyze',
        },
        changedFiles: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of changed file paths',
        },
      },
      required: ['changedFiles'],
    },
  },

  draftUpdate: {
    description: 'Draft documentation update for a specific file',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the documentation file',
        },
        changeDescription: {
          type: 'string',
          description: 'Description of changes that need documentation',
        },
        currentContent: {
          type: 'string',
          description: 'Current content of the documentation file',
        },
      },
      required: ['filePath', 'changeDescription'],
    },
  },

  generateScreenshots: {
    description: 'Generate instructions for capturing screenshots',
    parameters: {
      type: 'object',
      properties: {
        stagingUrl: {
          type: 'string',
          description: 'URL of the staging environment',
        },
        uiChanges: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of UI changes that need screenshots',
        },
      },
      required: ['stagingUrl', 'uiChanges'],
    },
  },

  commitChanges: {
    description: 'Commit documentation changes to git',
    parameters: {
      type: 'object',
      properties: {
        filesToUpdate: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of files to commit',
        },
        commitMessage: {
          type: 'string',
          description: 'Git commit message',
        },
        branchName: {
          type: 'string',
          description: 'Branch name for the commit',
        },
      },
      required: ['filesToUpdate', 'commitMessage'],
    },
  },
};

// Configuration for different Gemini usage patterns
export const geminiConfig = {
  // For autonomous agent workflows
  autonomous: {
    temperature: 0.1, // Low temperature for consistent, reliable output
    maxTokens: 4000,
    topP: 0.8,
  },

  // For interactive help center responses
  interactive: {
    temperature: 0.7, // Higher temperature for more natural conversation
    maxTokens: 2000,
    topP: 0.9,
  },

  // For code analysis and documentation generation
  documentation: {
    temperature: 0.2, // Balanced for accuracy with some creativity
    maxTokens: 8000,
    topP: 0.85,
  },
};

// Error handling for Gemini API
export class GeminiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

// Rate limiting configuration
export const rateLimits = {
  autonomous: {
    requestsPerMinute: 30,
    requestsPerHour: 500,
  },
  interactive: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
  },
  documentation: {
    requestsPerMinute: 20,
    requestsPerHour: 300,
  },
};

// Validate environment variables
export function validateGeminiConfig(): void {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GOOGLE_GENERATIVE_AI_API_KEY environment variable is required'
    );
  }

  if (apiKey.length < 20) {
    throw new Error('Invalid Google Generative AI API key format');
  }
}

// Initialize configuration
try {
  validateGeminiConfig();
} catch (error) {
  console.error('Gemini configuration error:', error);
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}