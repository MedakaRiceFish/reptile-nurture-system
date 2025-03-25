
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TaskFormValues } from "@/types/task";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const taskSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  due_date: z.date({ required_error: "Due date is required" }),
  due_time: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  related_type: z.enum(["enclosure", "hardware", "animal"]).optional(),
  related_id: z.string().uuid().optional(),
});

type TaskFormSchema = z.infer<typeof taskSchema>;

interface RelatedItem {
  id: string;
  name: string;
}

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: (task: TaskFormValues) => Promise<void>;
}

export function AddTaskDialog({ open, onOpenChange, onTaskAdded }: AddTaskDialogProps) {
  const { user } = useAuth();
  const [enclosures, setEnclosures] = useState<RelatedItem[]>([]);
  const [animals, setAnimals] = useState<RelatedItem[]>([]);
  const [hardware, setHardware] = useState<RelatedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<TaskFormSchema>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
    },
  });

  const relatedType = form.watch("related_type");
  
  useEffect(() => {
    if (!open) return;
    
    const fetchRelatedItems = async () => {
      try {
        // Fetch enclosures
        const { data: enclosureData } = await supabase
          .from('enclosures')
          .select('id, name');
        
        // Fetch animals
        const { data: animalData } = await supabase
          .from('animals')
          .select('id, name');
        
        // Fetch hardware devices
        const { data: hardwareData } = await supabase
          .from('hardware_devices')
          .select('id, name');
        
        if (enclosureData) setEnclosures(enclosureData);
        if (animalData) setAnimals(animalData);
        if (hardwareData) setHardware(hardwareData);
      } catch (error) {
        console.error('Error fetching related items:', error);
      }
    };
    
    fetchRelatedItems();
  }, [open]);
  
  // Clear related_id when related_type changes
  useEffect(() => {
    form.setValue("related_id", undefined);
  }, [relatedType, form]);

  const onSubmit = async (data: TaskFormSchema) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Format the data for the API
      const formattedTask: TaskFormValues = {
        title: data.title,
        description: data.description,
        due_date: format(data.due_date, 'yyyy-MM-dd'),
        due_time: data.due_time,
        priority: data.priority,
        related_type: data.related_type,
        related_id: data.related_id,
        status: 'pending',
      };
      
      await onTaskAdded(formattedTask);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter task description (optional)" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="due_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Time (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="time"
                          placeholder="Select time"
                          {...field}
                          value={field.value || ""}
                        />
                        <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="related_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related To (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="enclosure">Enclosure</SelectItem>
                      <SelectItem value="animal">Animal</SelectItem>
                      <SelectItem value="hardware">Hardware Device</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {relatedType && (
              <FormField
                control={form.control}
                name="related_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select {relatedType}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${relatedType}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relatedType === "enclosure" && enclosures.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                        {relatedType === "animal" && animals.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                        {relatedType === "hardware" && hardware.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
