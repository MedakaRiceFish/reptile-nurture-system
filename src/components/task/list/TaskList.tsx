
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";

interface TaskListProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskList({ tasks, onComplete, onDelete }: TaskListProps) {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map(task => (
        <Card key={task.id} className={`overflow-hidden ${isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date)) ? 'border-destructive/40' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base">{task.title}</CardTitle>
              {getPriorityBadge(task.priority)}
            </div>
            <CardDescription className="flex items-center mt-1">
              <Clock className="mr-1 h-3 w-3" />
              {task.due_time || "Any time"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
            {task.related_type && (
              <Badge variant="outline" className="mt-2">
                {task.related_type}
              </Badge>
            )}
          </CardContent>
          <CardFooter className="pt-2 flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => onComplete(task.id)}>
              <Check className="mr-1 h-4 w-4" /> Complete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
              <X className="mr-1 h-4 w-4" /> Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
