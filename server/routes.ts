import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { aiService } from "./services/ai";
import { createGitHubService } from "./services/github";
import { insertTaskSchema, insertMessageSchema, insertActivitySchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const taskSockets = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const taskId = url.searchParams.get('taskId');
    
    if (taskId) {
      if (!taskSockets.has(taskId)) {
        taskSockets.set(taskId, new Set());
      }
      taskSockets.get(taskId)!.add(ws);
      
      ws.on('close', () => {
        taskSockets.get(taskId)?.delete(ws);
        if (taskSockets.get(taskId)?.size === 0) {
          taskSockets.delete(taskId);
        }
      });
    }

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat' && taskId) {
          // Handle human-in-the-loop chat message
          const task = await storage.getTask(taskId);
          if (task) {
            // Save user message
            await storage.createMessage({
              taskId,
              sender: 'user',
              content: message.content,
              type: 'chat',
            });

            // Get AI response
            const context = {
              taskId,
              currentPhase: task.status,
              agentState: task.agentStates,
              conversationHistory: await storage.getMessagesByTask(taskId),
            };

            const aiResponse = await aiService.processHumanMessage(message.content, context);
            
            // Save AI response
            await storage.createMessage({
              taskId,
              sender: task.status === 'planning' ? 'planner' : 'programmer',
              content: aiResponse,
              type: 'chat',
            });

            // Broadcast to all clients for this task
            broadcastToTask(taskId, {
              type: 'new_messages',
              messages: await storage.getMessagesByTask(taskId),
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });

  function broadcastToTask(taskId: string, data: any) {
    const clients = taskSockets.get(taskId);
    if (clients) {
      const message = JSON.stringify(data);
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  // API Routes

  // User routes
  app.get('/api/user/:username', async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Repository routes
  app.get('/api/repositories/user/:userId', async (req, res) => {
    try {
      const repositories = await storage.getRepositoriesByUser(req.params.userId);
      res.json(repositories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/github/repositories/:username', async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user?.githubToken) {
        return res.status(401).json({ message: 'GitHub token required' });
      }

      const github = createGitHubService(user.githubToken);
      const repos = await github.getUserRepositories();
      res.json(repos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Task routes
  app.get('/api/tasks/user/:userId', async (req, res) => {
    try {
      const tasks = await storage.getTasksByUser(req.params.userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/tasks/active/user/:userId', async (req, res) => {
    try {
      const tasks = await storage.getActiveTasksByUser(req.params.userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      
      // Create initial activity
      await storage.createActivity({
        type: 'task_created',
        description: `New task created: ${task.title}`,
        taskId: task.id,
        userId: task.userId!,
      });

      // Start manager agent analysis
      setTimeout(async () => {
        try {
          const analysis = await aiService.managerAnalyzeTask(task.description || '');
          
          await storage.updateTask(task.id, {
            agentStates: { manager: 'complete', planner: 'active', programmer: 'waiting' },
            status: 'planning',
            metadata: { managerAnalysis: analysis },
          });

          broadcastToTask(task.id, {
            type: 'task_updated',
            task: await storage.getTask(task.id),
          });

          // Start planning phase
          if (analysis.requiredAgents.includes('planner')) {
            // This would trigger planner agent - simplified for demo
            setTimeout(async () => {
              await storage.updateTask(task.id, {
                agentStates: { manager: 'complete', planner: 'working', programmer: 'waiting' },
              });
              
              broadcastToTask(task.id, {
                type: 'task_updated',
                task: await storage.getTask(task.id),
              });
            }, 2000);
          }
        } catch (error) {
          console.error('Manager analysis error:', error);
        }
      }, 1000);

      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch('/api/tasks/:id', async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.id, req.body);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      broadcastToTask(task.id, {
        type: 'task_updated',
        task,
      });
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Plan approval/rejection
  app.post('/api/tasks/:id/approve-plan', async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const updatedTask = await storage.updateTask(req.params.id, {
        status: 'executing',
        agentStates: { manager: 'complete', planner: 'complete', programmer: 'active' },
      });

      await storage.createActivity({
        type: 'plan_approved',
        description: `Plan approved for task: ${task.title}`,
        taskId: task.id,
        userId: task.userId!,
      });

      broadcastToTask(task.id, {
        type: 'plan_approved',
        task: updatedTask,
      });

      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/tasks/:id/request-changes', async (req, res) => {
    try {
      const { feedback } = req.body;
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      await storage.createMessage({
        taskId: task.id,
        sender: 'user',
        content: feedback,
        type: 'plan_feedback',
      });

      const updatedTask = await storage.updateTask(req.params.id, {
        agentStates: { manager: 'complete', planner: 'revising', programmer: 'waiting' },
      });

      broadcastToTask(task.id, {
        type: 'plan_changes_requested',
        task: updatedTask,
        feedback,
      });

      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Message routes
  app.get('/api/messages/task/:taskId', async (req, res) => {
    try {
      const messages = await storage.getMessagesByTask(req.params.taskId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Activity routes
  app.get('/api/activities/user/:userId', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getActivitiesByUser(req.params.userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Statistics
  app.get('/api/stats/user/:userId', async (req, res) => {
    try {
      const tasks = await storage.getTasksByUser(req.params.userId);
      const activeTasks = tasks.filter(t => !['completed', 'failed'].includes(t.status));
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const openPRs = tasks.filter(t => t.pullRequestNumber && t.status !== 'completed');

      res.json({
        activeTasks: activeTasks.length,
        completed: completedTasks.length,
        openPRs: openPRs.length,
        totalTasks: tasks.length,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
