export interface AgentStates {
  manager: 'pending' | 'active' | 'complete' | 'error';
  planner: 'waiting' | 'active' | 'working' | 'revising' | 'complete' | 'error';
  programmer: 'waiting' | 'active' | 'working' | 'reviewing' | 'complete' | 'error';
}

export interface TaskWithProgress {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  repositoryId?: string;
  userId?: string;
  githubIssueNumber?: number;
  pullRequestNumber?: number;
  agentStates: AgentStates;
  plan?: any;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  repository?: {
    name: string;
    fullName: string;
  };
}

export interface ChatMessage {
  id: string;
  taskId?: string;
  sender: 'user' | 'manager' | 'planner' | 'programmer';
  content: string;
  type: 'chat' | 'plan' | 'code_diff' | 'system';
  metadata?: any;
  createdAt?: Date;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  taskId?: string;
  userId?: string;
  metadata?: any;
  createdAt?: Date;
}

export interface Stats {
  activeTasks: number;
  completed: number;
  openPRs: number;
  totalTasks: number;
}

export interface WebSocketMessage {
  type: 'task_updated' | 'new_messages' | 'plan_approved' | 'plan_changes_requested';
  task?: TaskWithProgress;
  messages?: ChatMessage[];
  feedback?: string;
}
