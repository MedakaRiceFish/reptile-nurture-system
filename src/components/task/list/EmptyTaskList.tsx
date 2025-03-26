
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

interface EmptyTaskListProps {
  onAddTask: () => void;
}

export function EmptyTaskList({ onAddTask }: EmptyTaskListProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="bg-muted p-4 rounded-full mb-4">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">No tasks found</h3>
      <p className="text-muted-foreground mt-1">
        Add a new task to get started
      </p>
      <Button className="mt-4" onClick={onAddTask}>
        <Plus className="mr-2 h-4 w-4" /> Add New Task
      </Button>
    </div>
  );
}
