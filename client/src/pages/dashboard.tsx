import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sidebar } from "@/components/sidebar";
import { TaskList } from "@/components/task-list";
import { ChatInterface } from "@/components/chat-interface";
import { PlanReviewModal } from "@/components/plan-review-modal";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/lib/websocket";
import type { TaskWithProgress, ChatMessage, Activity, Stats } from "@/types";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

// Demo user - in a real app, this would come from authentication
const DEMO_USER = { id: "demo-user", username: "demo" };

export default function Dashboard() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showPlanReview, setShowPlanReview] = useState(false);
  const [selectedPlanTask, setSelectedPlanTask] = useState<TaskWithProgress | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: "medium",
    },
  });

  // Get the demo user and fetch data dynamically
  const { data: user } = useQuery({
    queryKey: ['/api/user', DEMO_USER.username],
  });

  const userId = user?.id || DEMO_USER.id;

  // Fetch user statistics
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/stats/user', userId],
    enabled: !!userId,
  });

  // Fetch active tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<TaskWithProgress[]>({
    queryKey: ['/api/tasks/active/user', userId],
    enabled: !!userId,
  });

  // Fetch messages for selected task
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['/api/messages/task', selectedTaskId],
    enabled: !!selectedTaskId,
  });

  // Fetch recent activities
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities/user', userId],
    enabled: !!userId,
  });

  // WebSocket for real-time updates
  const { lastMessage } = useWebSocket(selectedTaskId);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'task_updated') {
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/active/user', userId] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats/user', userId] });
      }
      if (lastMessage.type === 'new_messages') {
        queryClient.invalidateQueries({ queryKey: ['/api/messages/task', selectedTaskId] });
      }
    }
  }, [lastMessage, queryClient, selectedTaskId, userId]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createTaskSchema>) => {
      return apiRequest('POST', '/api/tasks', {
        ...data,
        userId: userId,
        status: 'pending',
        progress: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/active/user', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/user', userId] });
      setShowCreateTask(false);
      form.reset();
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedTaskId) throw new Error('No task selected');
      
      // Send via WebSocket instead of HTTP for real-time chat
      const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws?taskId=${selectedTaskId}`);
      
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'chat',
          content,
        }));
        ws.close();
      };
    },
  });

  // Plan approval mutations
  const approvePlanMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest('POST', `/api/tasks/${taskId}/approve-plan`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/active/user', DEMO_USER_ID] });
      setShowPlanReview(false);
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: async ({ taskId, feedback }: { taskId: string; feedback: string }) => {
      return apiRequest('POST', `/api/tasks/${taskId}/request-changes`, { feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/active/user', DEMO_USER_ID] });
      setShowPlanReview(false);
    },
  });

  const handleCreateTask = (data: z.infer<typeof createTaskSchema>) => {
    createTaskMutation.mutate(data);
  };

  const handleOpenTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleReviewPlan = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedPlanTask(task);
      setShowPlanReview(true);
    }
  };

  const handlePauseTask = (taskId: string) => {
    // Implementation for pausing tasks
    console.log('Pause task:', taskId);
  };

  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate(content);
  };

  const getActiveAgent = (task?: TaskWithProgress) => {
    if (!task) return undefined;
    
    if (task.agentStates.programmer === 'working') return 'programmer';
    if (task.agentStates.planner === 'working') return 'planner';
    if (task.agentStates.manager === 'active') return 'manager';
    
    return undefined;
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTasks={stats?.activeTasks || 0} />
      
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 ml-0 lg:ml-0">
          <div className="flex items-center justify-between ml-12 lg:ml-0">
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-xs lg:text-sm text-gray-500 mt-1">Manage your AI coding tasks and workflows</p>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm px-2 lg:px-4">
                    <i className="fas fa-plus mr-1 lg:mr-2"></i>
                    <span className="hidden sm:inline">New Task</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateTask)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter task title..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe what you want the AI to implement..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-3">
                        <Button type="button" variant="outline" onClick={() => setShowCreateTask(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createTaskMutation.isPending}>
                          {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Button variant="ghost" size="sm">
                <i className="fas fa-bell text-lg"></i>
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column: Stats & Tasks */}
            <div className="xl:col-span-2 space-y-4 lg:space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <i className="fas fa-tasks text-white text-xs lg:text-sm"></i>
                        </div>
                      </div>
                      <div className="ml-3 lg:ml-4">
                        <p className="text-xs lg:text-sm font-medium text-gray-500">Active Tasks</p>
                        <p className="text-xl lg:text-2xl font-semibold text-gray-900">
                          {statsLoading ? '...' : stats?.activeTasks || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <i className="fas fa-check text-white text-xs lg:text-sm"></i>
                        </div>
                      </div>
                      <div className="ml-3 lg:ml-4">
                        <p className="text-xs lg:text-sm font-medium text-gray-500">Completed</p>
                        <p className="text-xl lg:text-2xl font-semibold text-gray-900">
                          {statsLoading ? '...' : stats?.completed || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="sm:col-span-2 lg:col-span-1">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                          <i className="fas fa-code-branch text-white text-xs lg:text-sm"></i>
                        </div>
                      </div>
                      <div className="ml-3 lg:ml-4">
                        <p className="text-xs lg:text-sm font-medium text-gray-500">Open PRs</p>
                        <p className="text-xl lg:text-2xl font-semibold text-gray-900">
                          {statsLoading ? '...' : stats?.openPRs || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Tasks */}
              <TaskList
                tasks={tasks}
                onOpenTask={handleOpenTask}
                onReviewPlan={handleReviewPlan}
                onPauseTask={handlePauseTask}
              />
            </div>

            {/* Right Column: Chat & Activities */}
            <div className="space-y-6">
              {/* Chat Interface */}
              <ChatInterface
                taskId={selectedTaskId}
                messages={messages}
                onSendMessage={handleSendMessage}
                activeAgent={getActiveAgent(selectedTask)}
              />

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.length === 0 ? (
                      <p className="text-gray-500 text-sm">No recent activity</p>
                    ) : (
                      activities.map((activity) => (
                        <div key={activity.id} className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              activity.type.includes('completed') || activity.type.includes('merged') 
                                ? 'bg-green-600' 
                                : activity.type.includes('failed') || activity.type.includes('error')
                                ? 'bg-red-600'
                                : activity.type.includes('review')
                                ? 'bg-yellow-600'
                                : 'bg-blue-600'
                            }`}>
                              <i className={`text-white text-xs ${
                                activity.type.includes('completed') || activity.type.includes('merged') 
                                  ? 'fas fa-check' 
                                  : activity.type.includes('failed') || activity.type.includes('error')
                                  ? 'fas fa-times'
                                  : activity.type.includes('review')
                                  ? 'fas fa-exclamation'
                                  : 'fas fa-circle'
                              }`}></i>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700">{activity.description}</p>
                            <p className="text-xs text-gray-500">
                              {activity.createdAt && new Date(activity.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Plan Review Modal */}
      <PlanReviewModal
        isOpen={showPlanReview}
        onClose={() => setShowPlanReview(false)}
        plan={selectedPlanTask?.plan}
        taskTitle={selectedPlanTask?.title || ''}
        onApprove={() => selectedPlanTask && approvePlanMutation.mutate(selectedPlanTask.id)}
        onRequestChanges={(feedback) => 
          selectedPlanTask && requestChangesMutation.mutate({ 
            taskId: selectedPlanTask.id, 
            feedback 
          })
        }
      />
    </div>
  );
}
