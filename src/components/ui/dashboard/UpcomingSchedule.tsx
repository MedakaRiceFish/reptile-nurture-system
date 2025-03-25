
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Utensils, Clipboard, Syringe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { AddTaskDialog } from "@/components/task/AddTaskDialog";
import { useTasks } from "@/hooks/useTasks";
import { TaskFormValues } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  type: "feeding" | "cleaning" | "health" | "other";
  onComplete: (id: string) => void;
}

function TaskItem({ id, title, dueDate, dueTime, type, onComplete }: TaskItemProps) {
  const getIcon = () => {
    switch (type) {
      case "feeding":
        return <Utensils className="h-4 w-4" />;
      case "cleaning":
        return <Clipboard className="h-4 w-4" />;
      case "health":
        return <Syringe className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case "feeding":
        return "bg-amber-100 text-amber-800";
      case "cleaning":
        return "bg-blue-100 text-blue-800";
      case "health":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
      } else {
        return format(date, "MMM dd");
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  return (
    <div className="flex items-center p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className={`${getColor()} p-2 rounded-lg mr-3`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Clock className="h-3 w-3 mr-1" />
          <span className="mr-2">{dueTime || "Any time"}</span>
          <Calendar className="h-3 w-3 mr-1" />
          <span>{formatDate(dueDate)}</span>
        </div>
      </div>
      <button 
        className="text-xs text-reptile-500 hover:text-reptile-600 font-medium ml-2"
        onClick={() => onComplete(id)}
      >
        Complete
      </button>
    </div>
  );
}

export function UpcomingSchedule() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { tasks, isLoading, addTask, completeTask } = useTasks(5);

  const handleAddTask = async (task: TaskFormValues) => {
    await addTask(task);
  };

  const getTaskType = (task: any): "feeding" | "cleaning" | "health" | "other" => {
    if (task.title.toLowerCase().includes("feed") || task.title.toLowerCase().includes("feeding")) {
      return "feeding";
    } else if (
      task.title.toLowerCase().includes("clean") || 
      task.title.toLowerCase().includes("cleaning") || 
      task.title.toLowerCase().includes("maintenance")
    ) {
      return "cleaning";
    } else if (
      task.title.toLowerCase().includes("health") || 
      task.title.toLowerCase().includes("vet") || 
      task.title.toLowerCase().includes("medicine") ||
      task.title.toLowerCase().includes("checkup")
    ) {
      return "health";
    }
    return "other";
  };

  return (
    <>
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Upcoming Schedule</span>
            <Button
              onClick={() => setDialogOpen(true)}
              className="text-xs px-2 py-1 bg-reptile-50 text-reptile-600 rounded-md font-medium hover:bg-reptile-100 transition-colors"
            >
              <Plus className="h-3 w-3 mr-1" /> Add Task
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("space-y-1", isLoading && "opacity-50")}>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>Loading tasks...</p>
              </div>
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  dueDate={task.due_date}
                  dueTime={task.due_time}
                  type={getTaskType(task)}
                  onComplete={completeTask}
                />
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No upcoming tasks</p>
                <p className="text-xs mt-1">Click 'Add Task' to create a new task</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AddTaskDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onTaskAdded={handleAddTask} 
      />
    </>
  );
}
