
import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { Task } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTaskDialog } from "@/components/task/AddTaskDialog";
import { TaskHeader } from "@/components/task/TaskHeader";
import { TaskInfo } from "@/components/task/TaskInfo";
import { TaskActions } from "@/components/task/TaskActions";
import { TaskNotFound } from "@/components/task/TaskNotFound";

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

  const handleTaskUpdated = async () => {
    if (!taskId) return;
    try {
      const updatedTask = await getTask(taskId);
      setTask(updatedTask);
    } catch (error) {
      console.error("Error updating task data:", error);
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
              <TaskHeader task={task} />
            </CardHeader>
            
            <CardContent>
              <TaskInfo task={task} />
            </CardContent>
            
            <CardFooter>
              <TaskActions 
                isCompleted={task.status === 'completed'}
                onEdit={() => setEditDialogOpen(true)}
                onDelete={handleDelete}
                onComplete={handleComplete}
              />
            </CardFooter>
          </Card>
        ) : (
          <TaskNotFound />
        )}
      </div>
      
      {task && (
        <AddTaskDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onTaskAdded={handleTaskUpdated}
          initialTask={task}
          isEditing={true}
        />
      )}
    </MainLayout>
  );
};

export default TaskDetail;
