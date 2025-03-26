
import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  due_date: z.date({ required_error: "Due date is required" }),
  due_time: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  related_type: z.enum(["enclosure", "hardware", "animal"]).optional(),
  related_id: z.string().uuid().optional(),
});

export type TaskFormSchema = z.infer<typeof taskSchema>;
