
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const TaskNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The task you're looking for doesn't exist or has been deleted.
      </p>
      <Button onClick={() => navigate('/tasks')}>
        Go to Tasks
      </Button>
    </div>
  );
};
