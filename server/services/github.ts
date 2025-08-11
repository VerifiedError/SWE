export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
  };
}

export class GitHubService {
  private token: string;
  private baseUrl = 'https://api.github.com';

  constructor(token: string) {
    this.token = token;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUserRepositories(username?: string): Promise<GitHubRepository[]> {
    const endpoint = username ? `/users/${username}/repos` : '/user/repos';
    return this.makeRequest(endpoint);
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.makeRequest(`/repos/${owner}/${repo}`);
  }

  async getRepositoryContents(
    owner: string, 
    repo: string, 
    path = '', 
    ref = 'main'
  ): Promise<any[]> {
    const endpoint = `/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
    return this.makeRequest(endpoint);
  }

  async getFileContent(
    owner: string, 
    repo: string, 
    path: string, 
    ref = 'main'
  ): Promise<string> {
    const response = await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}?ref=${ref}`);
    if (response.content) {
      return Buffer.from(response.content, 'base64').toString('utf-8');
    }
    throw new Error('File content not found');
  }

  async createIssue(
    owner: string, 
    repo: string, 
    title: string, 
    body: string,
    labels: string[] = []
  ): Promise<GitHubIssue> {
    return this.makeRequest(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title, body, labels }),
    });
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base = 'main'
  ): Promise<GitHubPullRequest> {
    return this.makeRequest(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({ title, body, head, base }),
    });
  }

  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    sha: string
  ): Promise<any> {
    return this.makeRequest(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha,
      }),
    });
  }

  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string,
    branch = 'main'
  ): Promise<any> {
    const body: any = {
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
    };

    if (sha) {
      body.sha = sha;
    }

    return this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async getLatestCommit(owner: string, repo: string, ref = 'main'): Promise<any> {
    const commits = await this.makeRequest(`/repos/${owner}/${repo}/commits?sha=${ref}&per_page=1`);
    return commits[0];
  }

  // Mock sandbox operations (in real implementation, these would interact with actual sandbox)
  async createSandbox(repositoryUrl: string): Promise<{ sandboxId: string; workingDirectory: string }> {
    // Mock implementation - in real app, this would create a containerized environment
    const sandboxId = `sandbox_${Date.now()}`;
    return {
      sandboxId,
      workingDirectory: `/tmp/${sandboxId}`,
    };
  }

  async executeSandboxCommand(
    sandboxId: string, 
    command: string
  ): Promise<{ output: string; exitCode: number }> {
    // Mock implementation - in real app, this would execute commands in sandbox
    return {
      output: `Mock execution of: ${command}`,
      exitCode: 0,
    };
  }
}

export const createGitHubService = (token: string) => new GitHubService(token);
