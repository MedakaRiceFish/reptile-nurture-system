
import React from "react";
import { Control } from "react-hook-form";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TaskFormSchema } from "../TaskFormSchema";

interface DateTimeFieldsProps {
  control: Control<TaskFormSchema>;
}

export function DateTimeFields({ control }: DateTimeFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
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
        control={control}
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
  );
}
