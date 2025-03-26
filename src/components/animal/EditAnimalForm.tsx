
import React, { useEffect } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { X, Save } from "lucide-react";
import { EditAnimalEnclosureField } from "./EditAnimalEnclosureField";
import { DialogFooter } from "@/components/ui/dialog";

interface EditAnimalFormProps {
  animal: any;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  isOpen: boolean;
}

export const EditAnimalForm: React.FC<EditAnimalFormProps> = ({
  animal,
  onOpenChange,
  onSave,
  isOpen
}) => {
  const form = useForm({
    defaultValues: {
      name: animal?.name || "",
      species: animal?.species || "",
      age: animal?.age?.toString() || "",
      length: animal?.length?.toString() || "",
      feedingSchedule: animal?.feeding_schedule || animal?.feedingSchedule || "",
      breederSource: animal?.breeding_source || animal?.breederSource || "",
      description: animal?.description || "",
      enclosure_id: animal?.enclosure_id || "none",
      customId: animal?.custom_id || ""
    }
  });

  // Update form values when animal changes
  useEffect(() => {
    if (animal && isOpen) {
      form.reset({
        name: animal?.name || "",
        species: animal?.species || "",
        age: animal?.age?.toString() || "",
        length: animal?.length?.toString() || "",
        feedingSchedule: animal?.feeding_schedule || animal?.feedingSchedule || "",
        breederSource: animal?.breeding_source || animal?.breederSource || "",
        description: animal?.description || "",
        enclosure_id: animal?.enclosure_id || "none",
        customId: animal?.custom_id || ""
      });
    }
  }, [animal, form, isOpen]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
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
          <FormField
            control={form.control}
            name="feedingSchedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feeding Schedule</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
