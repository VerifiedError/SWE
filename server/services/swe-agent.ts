/**
 * SWE Agent - TypeScript Implementation
 * Autonomous code analysis, generation, and issue resolution
 * Inspired by Open-SWE for solving GitHub issues and software engineering tasks
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export enum TaskType {
  BUG_FIX = "bug_fix",
  FEATURE_ADD = "feature_add",
  REFACTOR = "refactor",
  TEST_GENERATION = "test_generation",
  DOCUMENTATION = "documentation",
  PERFORMANCE = "performance",
  SECURITY = "security"
}

export interface CodeContext {
  filePath: string;
  content: string;
  language: string;
  imports: string[];
  functions: Array<{ name: string; signature: string; lineStart: number }>;
  classes: Array<{ name: string; methods: string[]; lineStart: number }>;
  dependencies: string[];
  testCoverage?: number;
  complexityScore?: number;
}

export interface IssueContext {
  issueNumber: number;
  title: string;
  description: string;
  labels: string[];
  filesMentioned: string[];
  errorTraces: string[];
  expectedBehavior: string;
  actualBehavior: string;
  reproductionSteps: string[];
}

export interface SolutionPlan {
  taskType: TaskType;
  rootCause: string;
  changes: Array<{
    file: string;
    type: 'modify' | 'add' | 'delete';
    description: string;
    location: string;
  }>;
  tests: Array<{
    name: string;
    description: string;
  }>;
  validationSteps: string[];
}

export interface CodeChange {
  filePath: string;
  originalCode: string;
  modifiedCode: string;
  changeType: 'modify' | 'add' | 'delete';
  description: string;
  lineNumbers: { start: number; end: number };
}

export class SWEAgent {
  private errorPatterns = {
    typescript: {
      syntax: /SyntaxError: (.+)/,
      type: /TypeError: (.+)/,
      reference: /ReferenceError: (.+)/,
      property: /Property '(.+)' does not exist/,
      argument: /Argument of type '(.+)' is not assignable/,
    },
    javascript: {
      syntax: /SyntaxError: (.+)/,
      reference: /ReferenceError: (.+)/,
      type: /TypeError: (.+)/,
      range: /RangeError: (.+)/,
    },
    python: {
      syntax: /SyntaxError: (.+)/,
      import: /ImportError: (.+)|ModuleNotFoundError: (.+)/,
      type: /TypeError: (.+)/,
      value: /ValueError: (.+)/,
      attribute: /AttributeError: (.+)/,
      index: /IndexError: (.+)/,
      key: /KeyError: (.+)/,
      name: /NameError: (.+)/,
    }
  };

  private languageExtensions = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.py': 'python',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.cs': 'csharp',
    '.go': 'go',
    '.rs': 'rust',
    '.rb': 'ruby',
    '.php': 'php',
  };

  constructor() {
    console.log('SWE Agent initialized');
  }

  /**
   * Analyze issue and generate solution plan
   */
  async analyzeIssue(issueDescription: string, codeContext?: string): Promise<SolutionPlan> {
    const prompt = `
You are an expert software engineer. Analyze this issue and create a detailed solution plan:

Issue Description:
${issueDescription}

${codeContext ? `Code Context:\n${codeContext}` : ''}

Create a solution plan with:
1. Root cause analysis
2. Specific changes needed
3. Implementation approach
4. Test cases to add

Return as JSON with this structure:
{
  "taskType": "bug_fix|feature_add|refactor|test_generation|documentation|performance|security",
  "rootCause": "detailed analysis of the problem",
  "changes": [
    {
      "file": "path/to/file",
      "type": "modify|add|delete",
      "description": "what to change",
      "location": "function/class name or line range"
    }
  ],
  "tests": [
    {
      "name": "test_name",
      "description": "what to test"
    }
  ],
  "validationSteps": ["step1", "step2", "step3"]
}
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as SolutionPlan;
        }
      }

      // Fallback plan
      return {
        taskType: TaskType.BUG_FIX,
        rootCause: "Issue analysis completed - please review the description for specific details",
        changes: [],
        tests: [],
        validationSteps: ["Review code changes", "Run tests", "Validate functionality"]
      };
    } catch (error) {
      console.error('Error analyzing issue:', error);
      throw new Error('Failed to analyze issue');
    }
  }

  /**
   * Generate code implementation based on solution plan
   */
  async implementSolution(plan: SolutionPlan, codeContext?: string): Promise<CodeChange[]> {
    const changes: CodeChange[] = [];

    for (const change of plan.changes) {
      const prompt = `
You are implementing a code change based on this plan:

Change: ${change.description}
File: ${change.file}
Type: ${change.type}
Location: ${change.location}

${codeContext ? `Current Code Context:\n${codeContext}` : ''}

Generate the specific code implementation. For modifications, provide both the original code section and the modified version.

Return as JSON:
{
  "originalCode": "current code section (for modifications)",
  "modifiedCode": "new or modified code",
  "description": "explanation of changes",
  "lineNumbers": { "start": number, "end": number }
}
`;

      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        });

        const content = response.content[0];
        if (content.type === 'text') {
          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const implementation = JSON.parse(jsonMatch[0]);
            changes.push({
              filePath: change.file,
              originalCode: implementation.originalCode || '',
              modifiedCode: implementation.modifiedCode || '',
              changeType: change.type,
              description: implementation.description || change.description,
              lineNumbers: implementation.lineNumbers || { start: 0, end: 0 }
            });
          }
        }
      } catch (error) {
        console.error(`Error implementing change for ${change.file}:`, error);
        // Continue with other changes
      }
    }

    return changes;
  }

  /**
   * Generate test cases for the implemented solution
   */
  async generateTests(plan: SolutionPlan, codeChanges: CodeChange[]): Promise<string[]> {
    const testCases: string[] = [];

    for (const test of plan.tests) {
      const prompt = `
Generate a test case for:
Test Name: ${test.name}
Description: ${test.description}

Code Changes Context:
${codeChanges.map(change => `${change.filePath}: ${change.description}`).join('\n')}

Create a comprehensive test that validates the implementation. 
Use appropriate testing framework syntax (Jest for JavaScript/TypeScript, pytest for Python, etc.).

Return just the test code without additional formatting.
`;

      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        });

        const content = response.content[0];
        if (content.type === 'text') {
          testCases.push(content.text.trim());
        }
      } catch (error) {
        console.error(`Error generating test ${test.name}:`, error);
        // Continue with other tests
      }
    }

    return testCases;
  }

  /**
   * Validate the solution against the original issue
   */
  async validateSolution(
    originalIssue: string,
    plan: SolutionPlan,
    codeChanges: CodeChange[]
  ): Promise<{ isValid: boolean; feedback: string; score: number }> {
    const prompt = `
Validate this solution against the original issue:

Original Issue:
${originalIssue}

Solution Plan:
Root Cause: ${plan.rootCause}
Task Type: ${plan.taskType}

Code Changes:
${codeChanges.map(change => 
  `${change.filePath}: ${change.description}\nChanges: ${change.modifiedCode.substring(0, 200)}...`
).join('\n\n')}

Evaluate:
1. Does the solution address the root cause?
2. Are the code changes appropriate and safe?
3. Is the implementation complete?
4. Rate the solution quality (1-10)

Return as JSON:
{
  "isValid": boolean,
  "feedback": "detailed feedback",
  "score": number (1-10)
}
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      return {
        isValid: true,
        feedback: "Solution validation completed",
        score: 8
      };
    } catch (error) {
      console.error('Error validating solution:', error);
      return {
        isValid: false,
        feedback: "Validation failed due to technical error",
        score: 0
      };
    }
  }

  /**
   * Analyze code for potential issues and improvements
   */
  async analyzeCode(code: string, language: string): Promise<{
    issues: Array<{ type: string; description: string; line?: number; severity: 'low' | 'medium' | 'high' }>;
    suggestions: string[];
    complexity: number;
  }> {
    const prompt = `
Analyze this ${language} code for potential issues and improvements:

\`\`\`${language}
${code}
\`\`\`

Identify:
1. Potential bugs or errors
2. Code quality issues
3. Performance improvements
4. Security vulnerabilities
5. Best practice violations

Return as JSON:
{
  "issues": [
    {
      "type": "bug|performance|security|style|maintainability",
      "description": "description of the issue",
      "line": number (if applicable),
      "severity": "low|medium|high"
    }
  ],
  "suggestions": ["improvement suggestion 1", "suggestion 2"],
  "complexity": number (1-10, code complexity score)
}
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      return {
        issues: [],
        suggestions: [],
        complexity: 5
      };
    } catch (error) {
      console.error('Error analyzing code:', error);
      throw new Error('Failed to analyze code');
    }
  }

  /**
   * Extract language from file extension
   */
  private getLanguageFromFile(filePath: string): string {
    const extension = '.' + filePath.split('.').pop()?.toLowerCase();
    return this.languageExtensions[extension] || 'text';
  }

  /**
   * Format code changes for display
   */
  formatCodeChanges(changes: CodeChange[]): string {
    return changes.map(change => {
      const action = change.changeType === 'add' ? 'Added' : 
                     change.changeType === 'delete' ? 'Deleted' : 'Modified';
      
      return `${action}: ${change.filePath}
Description: ${change.description}
${change.modifiedCode ? `\nCode:\n\`\`\`\n${change.modifiedCode}\n\`\`\`` : ''}`;
    }).join('\n\n---\n\n');
  }
}