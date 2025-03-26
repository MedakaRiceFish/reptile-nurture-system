
import React from "react";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { Calendar } from "lucide-react";
import { Task } from "@/types/task";
import { TaskList } from "./TaskList";

interface TaskGroupProps {
  date: string;
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskGroup({ date, tasks, onComplete, onDelete }: TaskGroupProps) {
  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else if (isPast(date) && !isToday(date)) {
      return `Overdue - ${format(date, "MMMM d, yyyy")}`;
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
        <h2 className={`text-lg font-semibold ${isPast(parseISO(date)) && !isToday(parseISO(date)) ? 'text-destructive' : ''}`}>
          {formatDateHeader(date)}
        </h2>
      </div>
      <TaskList tasks={tasks} onComplete={onComplete} onDelete={onDelete} />
    </div>
  );
}
