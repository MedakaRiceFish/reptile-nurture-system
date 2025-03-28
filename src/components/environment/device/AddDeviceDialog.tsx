
import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DeviceDialogContent } from "./DeviceDialogContent";
import { DeviceFormValues } from "./DeviceFormSchema";

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: DeviceFormValues) => void;
  enclosureId: string;
  enclosureName: string;
}

export const AddDeviceDialog: React.FC<AddDeviceDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  enclosureId,
  enclosureName
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
          <DialogDescription>
            Add a new hardware device to track in this enclosure.
          </DialogDescription>
        </DialogHeader>
        
        <DeviceDialogContent 
          onSave={onSave} 
          enclosureId={enclosureId}
          enclosureName={enclosureName}
        />
      </DialogContent>
    </Dialog>
  );
};
