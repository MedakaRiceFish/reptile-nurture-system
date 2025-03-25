
import React from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getRandomPlaceholderImage } from "@/utils/enclosureHelpers";

interface AddEnclosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface EnclosureFormValues {
  name: string;
  type: string;
  temperature: string;
  humidity: string;
}

export function AddEnclosureDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddEnclosureDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<EnclosureFormValues>({
    defaultValues: {
      name: "",
      type: "",
      temperature: "75",
      humidity: "50",
    },
  });

  const onSubmit = async (values: EnclosureFormValues) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const newEnclosure = {
        name: values.name,
        type: values.type || "Terrarium",
        temperature: parseFloat(values.temperature),
        humidity: parseFloat(values.humidity),
        image_url: getRandomPlaceholderImage(),
        owner_id: user.id,
        reading_status: "Active",
      };
      
      const { error } = await supabase
        .from("enclosures")
        .insert(newEnclosure);
        
      if (error) throw error;
      
      toast({
        title: "Enclosure created",
        description: `${values.name} has been created successfully.`,
      });
      
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error("Error creating enclosure:", error);
      toast({
        title: "Error creating enclosure",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Enclosure</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enclosure Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Tropical Terrarium" />
                  </FormControl>
                  <FormDescription>
                    Give your enclosure a descriptive name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Terrarium, Aquarium" />
                  </FormControl>
                  <FormDescription>
                    Type of enclosure
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature (°F)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="humidity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Humidity (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Enclosure"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
