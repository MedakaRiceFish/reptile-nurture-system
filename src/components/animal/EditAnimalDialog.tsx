
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditAnimalForm } from "./EditAnimalForm";

interface EditAnimalDialogProps {
  animal: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

export const EditAnimalDialog: React.FC<EditAnimalDialogProps> = ({
  animal,
  isOpen,
  onOpenChange,
  onSave,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Animal Details</DialogTitle>
        </DialogHeader>
        <EditAnimalForm 
          animal={animal}
          onOpenChange={onOpenChange}
          onSave={onSave}
          isOpen={isOpen}
        />
      </DialogContent>
    </Dialog>
  );
};
