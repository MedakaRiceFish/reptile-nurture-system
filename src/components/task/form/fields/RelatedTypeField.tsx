
import React from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskFormSchema } from "../TaskFormSchema";

interface RelatedTypeFieldProps {
  control: Control<TaskFormSchema>;
}

export function RelatedTypeField({ control }: RelatedTypeFieldProps) {
  return (
    <FormField
      control={control}
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
  );
}
