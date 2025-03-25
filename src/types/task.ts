
export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  due_time?: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  related_type?: 'enclosure' | 'hardware' | 'animal';
  related_id?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type TaskFormValues = Omit<Task, 'id' | 'owner_id' | 'created_at' | 'updated_at' | 'status'> & {
  status?: 'pending' | 'completed' | 'overdue';
};
