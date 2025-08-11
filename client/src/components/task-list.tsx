import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TaskWithProgress } from "@/types";

interface TaskListProps {
  tasks: TaskWithProgress[];
  onOpenTask: (taskId: string) => void;
  onReviewPlan: (taskId: string) => void;
  onPauseTask: (taskId: string) => void;
}

export function TaskList({ tasks, onOpenTask, onReviewPlan, onPauseTask }: TaskListProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: { color: 'bg-blue-100 text-blue-800', label: 'Planning' },
      executing: { color: 'bg-green-100 text-green-800', label: 'Executing' },
      review_required: { color: 'bg-yellow-100 text-yellow-800', label: 'Review Required' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`${config.color} text-xs font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getAgentStatusDot = (agentStatus: string) => {
    const statusColors = {
      pending: 'bg-gray-300',
      waiting: 'bg-gray-300',
      active: 'bg-blue-600',
      working: 'bg-yellow-500 animate-pulse',
      revising: 'bg-yellow-500 animate-pulse',
      complete: 'bg-green-600',
      error: 'bg-red-600',
    };

    return statusColors[agentStatus as keyof typeof statusColors] || 'bg-gray-300';
  };

  const getAgentStatusLabel = (agent: string, status: string) => {
    const labels = {
      pending: 'Pending',
      waiting: 'Waiting',
      active: 'Active',
      working: 'Working',
      revising: 'Revising',
      complete: 'Complete',
      error: 'Error',
    };

    const label = labels[status as keyof typeof labels] || status;
    return `${agent}: ${label}`;
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <i className="fas fa-tasks text-gray-400 text-3xl"></i>
            <h3 className="text-lg font-medium text-gray-900">No active tasks</h3>
            <p className="text-sm text-gray-500">Create a new task to get started with AI-powered coding assistance.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Active Tasks</h2>
        <p className="text-sm text-gray-500 mt-1">Click on a task to start chatting with AI agents</p>
      </div>
      <div className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onOpenTask(task.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{task.title}</h3>
                  {getStatusBadge(task.status)}
                </div>
                
                {task.repository && (
                  <p className="text-sm text-gray-500 mb-3">{task.repository.fullName}</p>
                )}
                
                {/* Agent Status */}
                <div className="flex items-center space-x-4 text-xs mb-3">
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getAgentStatusDot(task.agentStates.manager)}`}></div>
                    <span className="text-gray-600">{getAgentStatusLabel('Manager', task.agentStates.manager)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getAgentStatusDot(task.agentStates.planner)}`}></div>
                    <span className="text-gray-600">{getAgentStatusLabel('Planner', task.agentStates.planner)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getAgentStatusDot(task.agentStates.programmer)}`}></div>
                    <span className="text-gray-600">{getAgentStatusLabel('Programmer', task.agentStates.programmer)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs text-gray-500">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {task.status === 'review_required' && (
                  <Button
                    size="sm"
                    onClick={() => onReviewPlan(task.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Review Plan
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenTask(task.id)}
                  className="text-gray-400 hover:text-blue-600"
                >
                  <i className="fas fa-external-link-alt"></i>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPauseTask(task.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-pause"></i>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
