
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle } from "lucide-react";

interface TaskActionsProps {
  isCompleted: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
}

export const TaskActions = ({ isCompleted, onEdit, onDelete, onComplete }: TaskActionsProps) => {
  return (
    <div className="flex justify-between pt-6">
      <div>
        <Button
          variant="outline"
          onClick={onEdit}
          className="mr-2"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
      
      {!isCompleted && (
        <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark as Complete
        </Button>
      )}
    </div>
  );
};
