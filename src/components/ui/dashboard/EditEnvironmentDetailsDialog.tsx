
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { X, Save } from "lucide-react";

// Define the interface for environment/enclosure data
interface EnvironmentDetails {
  type: string;
  size: string;
  substrate: string;
  plants: string[];
}

// Define form values type (note that plants is a string in the form)
interface EnvironmentFormValues {
  type: string;
  size: string;
  substrate: string;
  plants: string;
}

interface EditEnvironmentDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  enclosure: EnvironmentDetails;
  onSave: (data: EnvironmentDetails) => void;
}

export const EditEnvironmentDetailsDialog: React.FC<EditEnvironmentDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  enclosure,
  onSave
}) => {
  const form = useForm<EnvironmentFormValues>({
    defaultValues: {
      type: enclosure?.type || "",
      size: enclosure?.size || "",
      substrate: enclosure?.substrate || "",
      plants: enclosure?.plants ? enclosure.plants.join(", ") : ""
    }
  });

  const handleSubmit = (data: EnvironmentFormValues) => {
    // Convert plants string back to array
    const formattedData: EnvironmentDetails = {
      ...data,
      plants: data.plants.split(",").map((plant: string) => plant.trim()).filter(Boolean)
    };
    
    onSave(formattedData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Environment Details</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Environment Type</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="substrate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Substrate</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="plants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plants (comma-separated)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
