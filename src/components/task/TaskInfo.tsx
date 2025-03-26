
import React from "react";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isAfter } from "date-fns";
import { InfoIcon, LinkIcon, AlertTriangle } from "lucide-react";

interface TaskInfoProps {
  task: Task;
}

export const TaskInfo = ({ task }: TaskInfoProps) => {
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
  
  return (
    <div className="space-y-6">
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
    </div>
  );
};
