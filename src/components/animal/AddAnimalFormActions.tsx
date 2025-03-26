
import React from "react";
import { Button } from "@/components/ui/button";

interface AddAnimalFormActionsProps {
  onCancel: () => void;
}

export const AddAnimalFormActions: React.FC<AddAnimalFormActionsProps> = ({ onCancel }) => {
  return (
    <div className="flex justify-end gap-2 mt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit">Add Animal</Button>
    </div>
  );
};
