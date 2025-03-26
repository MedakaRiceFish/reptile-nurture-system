
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { TaskFormSchema, taskSchema } from "./TaskFormSchema";
import { Task, TaskFormValues } from "@/types/task";
import { TitleField } from "./fields/TitleField";
import { DescriptionField } from "./fields/DescriptionField";
import { DateTimeFields } from "./fields/DateTimeFields";
import { PriorityField } from "./fields/PriorityField";
import { RelatedTypeField } from "./fields/RelatedTypeField";
import { RelatedItemField } from "./fields/RelatedItemField";

interface TaskFormProps {
  onSubmit: (data: TaskFormSchema) => Promise<void>;
  initialTask?: Task;
  isEditing?: boolean;
  isLoading: boolean;
}

export function TaskForm({ onSubmit, initialTask, isEditing = false, isLoading }: TaskFormProps) {
  // Initialize form with initialTask data if editing
  const form = useForm<TaskFormSchema>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialTask ? {
      title: initialTask.title,
      description: initialTask.description || "",
      due_date: new Date(initialTask.due_date),
      due_time: initialTask.due_time || "",
      priority: initialTask.priority,
      related_type: initialTask.related_type,
      related_id: initialTask.related_id,
    } : {
      title: "",
      description: "",
      priority: "medium",
    },
  });

  const relatedType = form.watch("related_type");

  const handleSubmit = async (data: TaskFormSchema) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <TitleField control={form.control} />
        <DescriptionField control={form.control} />
        <DateTimeFields control={form.control} />
        <PriorityField control={form.control} />
        <RelatedTypeField control={form.control} />
        {relatedType && (
          <RelatedItemField 
            control={form.control} 
            relatedType={relatedType} 
          />
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Task")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
