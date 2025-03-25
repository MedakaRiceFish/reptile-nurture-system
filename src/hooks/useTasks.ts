
import { useState, useEffect, useCallback } from 'react';
import { Task, TaskFormValues } from '@/types/task';
import { 
  createTask, 
  deleteTask, 
  deleteTasks,
  getTaskById, 
  getTasks, 
  getUpcomingTasks, 
  updateTaskStatus,
  updateTasksStatus
} from '@/services/taskService';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useTasks = (limit = 5) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const navigate = useNavigate();

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

  const fetchAllTasks = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error in fetchAllTasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getTask = useCallback(async (taskId: string) => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      return await getTaskById(taskId);
    } catch (error) {
      console.error('Error in getTask:', error);
      toast.error('Failed to load task');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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

  const completeTasks = useCallback(async (taskIds: string[]) => {
    if (!user || taskIds.length === 0) return;
    
    try {
      await updateTasksStatus(taskIds, 'completed');
      setTasks(prev => prev.filter(task => !taskIds.includes(task.id)));
      setSelectedTaskIds([]);
      toast.success(`${taskIds.length} tasks marked as complete`);
    } catch (error) {
      console.error('Error in completeTasks:', error);
      toast.error('Failed to complete tasks');
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

  const removeTasks = useCallback(async (taskIds: string[]) => {
    if (!user || taskIds.length === 0) return;
    
    try {
      await deleteTasks(taskIds);
      setTasks(prev => prev.filter(task => !taskIds.includes(task.id)));
      setSelectedTaskIds([]);
      toast.success(`${taskIds.length} tasks deleted successfully`);
    } catch (error) {
      console.error('Error in removeTasks:', error);
      toast.error('Failed to delete tasks');
    }
  }, [user]);

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  }, []);

  const selectAllTasks = useCallback(() => {
    setSelectedTaskIds(tasks.map(task => task.id));
  }, [tasks]);

  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  const viewTaskDetails = useCallback((taskId: string) => {
    navigate(`/tasks/${taskId}`);
  }, [navigate]);

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

  return { 
    tasks, 
    isLoading, 
    addTask, 
    completeTask, 
    completeTasks,
    removeTask, 
    removeTasks,
    refreshTasks: fetchTasks,
    fetchAllTasks,
    getTask,
    selectedTaskIds,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    viewTaskDetails
  };
};
