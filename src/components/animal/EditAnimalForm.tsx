
import React, { useEffect } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { X, Save } from "lucide-react";
import { EditAnimalEnclosureField } from "./EditAnimalEnclosureField";
import { DialogFooter } from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface EditAnimalFormProps {
  animal: any;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  isOpen: boolean;
}

const FEEDING_FREQUENCIES = [
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" }
];

export const EditAnimalForm: React.FC<EditAnimalFormProps> = ({
  animal,
  onOpenChange,
  onSave,
  isOpen
}) => {
  // Parse feeding schedule into interval and frequency
  const parseFeedingSchedule = (schedule: string | null) => {
    if (!schedule) return { interval: "", frequency: "days" };
    
    try {
      const parts = schedule.split(':');
      if (parts.length === 2) {
        return {
          interval: parts[0],
          frequency: parts[1]
        };
      }
    } catch (error) {
      console.error("Error parsing feeding schedule:", error);
    }
    
    return { interval: "", frequency: "days" };
  };
  
  const { interval, frequency } = parseFeedingSchedule(animal?.feeding_schedule);
  
  const form = useForm({
    defaultValues: {
      name: animal?.name || "",
      species: animal?.species || "",
      age: animal?.age?.toString() || "",
      length: animal?.length?.toString() || "",
      feedingInterval: interval,
      feedingFrequency: frequency,
      breederSource: animal?.breeding_source || animal?.breederSource || "",
      description: animal?.description || "",
      enclosure_id: animal?.enclosure_id || "none",
      customId: animal?.custom_id || ""
    }
  });

  // Update form values when animal changes
  useEffect(() => {
    if (animal && isOpen) {
      const { interval, frequency } = parseFeedingSchedule(animal?.feeding_schedule);
      
      form.reset({
        name: animal?.name || "",
        species: animal?.species || "",
        age: animal?.age?.toString() || "",
        length: animal?.length?.toString() || "",
        feedingInterval: interval,
        feedingFrequency: frequency,
        breederSource: animal?.breeding_source || animal?.breederSource || "",
        description: animal?.description || "",
        enclosure_id: animal?.enclosure_id || "none",
        customId: animal?.custom_id || ""
      });
    }
  }, [animal, form, isOpen]);

  // Create a combined feeding schedule from interval and frequency
  const combineFeedingSchedule = (data: any) => {
    if (data.feedingInterval && data.feedingFrequency) {
      const formattedData = { ...data };
      
      // Combine the feeding interval and frequency into the feeding_schedule format
      formattedData.feedingSchedule = `${data.feedingInterval}:${data.feedingFrequency}`;
      
      // Delete the individual fields as they're not needed for the API
      delete formattedData.feedingInterval;
      delete formattedData.feedingFrequency;
      
      return formattedData;
    }
    return data;
  };

  const handleSubmit = (data: any) => {
    const formattedData = combineFeedingSchedule(data);
    onSave(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Species</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Length (cm)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="feedingInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feeding Interval</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="1" 
                      max="99"
                      maxLength={2}
                      placeholder="Enter a number (1-99)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedingFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FEEDING_FREQUENCIES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="breederSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breeder Source</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom ID</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={10} placeholder="Max 10 characters" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <EditAnimalEnclosureField control={form.control} />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
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
  );
};
