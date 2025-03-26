import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { TaskFormSchema } from "./form/TaskFormSchema";
import { Task, TaskFormValues } from "@/types/task";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { TaskForm } from "./form/TaskForm";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: (task: TaskFormValues) => Promise<void>;
  initialTask?: Task;
  isEditing?: boolean;
}

export function AddTaskDialog({ 
  open, 
  onOpenChange, 
  onTaskAdded, 
  initialTask, 
  isEditing = false 
}: AddTaskDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: TaskFormSchema) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Format the data for the API
      const formattedTask: TaskFormValues = {
        title: data.title,
        description: data.description,
        due_date: format(data.due_date, 'yyyy-MM-dd'),
        due_time: data.due_time,
        priority: data.priority,
        related_type: data.related_type,
        related_id: data.related_id,
        status: initialTask?.status || 'pending',
      };
      
      await onTaskAdded(formattedTask);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        
        <TaskForm 
          onSubmit={handleSubmit} 
          initialTask={initialTask} 
          isEditing={isEditing}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
