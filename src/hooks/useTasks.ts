
import { useState, useEffect, useCallback } from 'react';
import { Task, TaskFormValues } from '@/types/task';
import { createTask, deleteTask, getUpcomingTasks, updateTaskStatus } from '@/services/taskService';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTasks = (limit = 5) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await getUpcomingTasks(limit);
      setTasks(data);
    } catch (error) {
      console.error('Error in fetchTasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [user, limit]);

  const addTask = useCallback(async (taskData: TaskFormValues) => {
    if (!user) return null;
    
    try {
      const newTask = await createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      toast.success('Task created successfully');
      return newTask;
    } catch (error) {
      console.error('Error in addTask:', error);
      toast.error('Failed to create task');
      return null;
    }
  }, [user]);

  const completeTask = useCallback(async (taskId: string) => {
    if (!user) return;
    
    try {
      await updateTaskStatus(taskId, 'completed');
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task marked as complete');
    } catch (error) {
      console.error('Error in completeTask:', error);
      toast.error('Failed to complete task');
    }
  }, [user]);

  const removeTask = useCallback(async (taskId: string) => {
    if (!user) return;
    
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error in removeTask:', error);
      toast.error('Failed to delete task');
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks'
      }, () => {
        fetchTasks();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  return { tasks, isLoading, addTask, completeTask, removeTask, refreshTasks: fetchTasks };
};
