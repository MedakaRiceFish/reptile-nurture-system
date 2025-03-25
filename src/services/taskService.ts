
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskFormValues } from "@/types/task";

export const getTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true })
    .order('due_time', { ascending: true, nullsFirst: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return data as Task[];
};

export const getUpcomingTasks = async (limit = 5) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'pending')
    .order('due_date', { ascending: true })
    .order('due_time', { ascending: true, nullsFirst: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming tasks:', error);
    throw error;
  }

  return data as Task[];
};

export const createTask = async (taskData: TaskFormValues) => {
  // Get the current user id
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const taskWithOwner = {
    ...taskData,
    owner_id: user.id
  };
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskWithOwner)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  return data as Task;
};

export const updateTaskStatus = async (taskId: string, status: Task['status']) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task status:', error);
    throw error;
  }

  return data as Task;
};

export const deleteTask = async (taskId: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }

  return true;
};
