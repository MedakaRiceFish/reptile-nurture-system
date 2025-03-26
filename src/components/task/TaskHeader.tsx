
import React from "react";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { CardTitle, CardDescription } from "@/components/ui/card";

interface TaskHeaderProps {
  task: Task;
}

export const TaskHeader = ({ task }: TaskHeaderProps) => {
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
  );
};
