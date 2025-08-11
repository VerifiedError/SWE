import { 
  users, repositories, tasks, messages, activities,
  type User, type InsertUser,
  type Repository, type InsertRepository,
  type Task, type InsertTask,
  type Message, type InsertMessage,
  type Activity, type InsertActivity
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Repository operations
  getRepository(id: string): Promise<Repository | undefined>;
  getRepositoriesByUser(userId: string): Promise<Repository[]>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  
  // Task operations
  getTask(id: string): Promise<Task | undefined>;
  getTasksByUser(userId: string): Promise<Task[]>;
  getActiveTasksByUser(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  
  // Message operations
  getMessagesByTask(taskId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Activity operations
  getActivitiesByUser(userId: string, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private repositories: Map<string, Repository> = new Map();
  private tasks: Map<string, Task> = new Map();
  private messages: Map<string, Message> = new Map();
  private activities: Map<string, Activity> = new Map();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email || null,
      githubToken: insertUser.githubToken || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Repository operations
  async getRepository(id: string): Promise<Repository | undefined> {
    return this.repositories.get(id);
  }

  async getRepositoriesByUser(userId: string): Promise<Repository[]> {
    return Array.from(this.repositories.values()).filter(repo => repo.userId === userId);
  }

  async createRepository(insertRepository: InsertRepository): Promise<Repository> {
    const id = randomUUID();
    const repository: Repository = {
      ...insertRepository,
      id,
      userId: insertRepository.userId || null,
      createdAt: new Date(),
    };
    this.repositories.set(id, repository);
    return repository;
  }

  // Task operations
  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  async getActiveTasksByUser(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.userId === userId && !['completed', 'failed'].includes(task.status)
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      progress: insertTask.progress || 0,
      agentStates: insertTask.agentStates || { manager: 'pending', planner: 'waiting', programmer: 'waiting' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { 
      ...task, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Message operations
  async getMessagesByTask(taskId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.taskId === taskId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      metadata: insertMessage.metadata || {},
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  // Activity operations
  async getActivitiesByUser(userId: string, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      ...insertActivity,
      id,
      metadata: insertActivity.metadata || {},
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
