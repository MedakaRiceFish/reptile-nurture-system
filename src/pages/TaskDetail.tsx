import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { Task } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Trash2, 
  Pencil,
  AlertTriangle,
  InfoIcon,
  LinkIcon
} from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTaskDialog } from "@/components/task/AddTaskDialog";

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { getTask, completeTask, removeTask } = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) return;
      
      try {
        setIsLoading(true);
        const taskData = await getTask(taskId);
        setTask(taskData);
      } catch (error) {
        console.error("Error loading task:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTask();
  }, [taskId, getTask]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleComplete = async () => {
    if (!task) return;
    
    await completeTask(task.id);
    navigate('/tasks');
  };

  const handleDelete = async () => {
    if (!task) return;
    
    await removeTask(task.id);
    navigate('/tasks');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const isOverdue = (task: Task) => {
    const today = new Date();
    const dueDate = parseISO(task.due_date);
    return isAfter(today, dueDate) && task.status === 'pending';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string, isTaskOverdue: boolean) => {
    if (isTaskOverdue) {
      return <Badge variant="destructive" className="ml-2">Overdue</Badge>;
    }
    
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="ml-2 bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="ml-2">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <MainLayout pageTitle="Task Details">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleGoBack} 
            className="pl-0 flex items-center text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ) : task ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    {task.title}
                    {getStatusBadge(task.status, isOverdue(task))}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-2">
                    <div className="flex items-center mr-4">
                      <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                    {task.due_time && (
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{task.due_time}</span>
                      </div>
                    )}
                  </CardDescription>
                </div>
                <div>{getPriorityBadge(task.priority)}</div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {task.description && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Description</h3>
                  <p className="text-sm whitespace-pre-line">{task.description}</p>
                </div>
              )}
              
              {task.related_type && task.related_id && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Related Item
                  </h3>
                  <div className="flex items-center">
                    <Badge variant="outline" className="capitalize">
                      {task.related_type}
                    </Badge>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ID: {task.related_id}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <InfoIcon className="h-4 w-4 mr-1" />
                  Task Information
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{formatDate(task.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p>{formatDate(task.updated_at)}</p>
                  </div>
                </div>
              </div>
              
              {isOverdue(task) && (
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <div className="flex items-center text-destructive">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <p className="font-medium">This task is overdue</p>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between pt-6">
              <div>
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(true)}
                  className="mr-2"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
              
              {task.status !== 'completed' && (
                <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The task you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/tasks')}>
              Go to Tasks
            </Button>
          </div>
        )}
      </div>
      
      {task && (
        <AddTaskDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onTaskAdded={() => {}}
          initialTask={task}
          isEditing={true}
        />
      )}
    </MainLayout>
  );
};

export default TaskDetail;
