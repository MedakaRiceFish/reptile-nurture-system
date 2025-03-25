
import { z } from "zod";

// Define the schema for the device form
export const deviceFormSchema = z.object({
  name: z.string().min(1, "Device name is required"),
  type: z.string().min(1, "Device type is required"),
  lastMaintenance: z.date(),
  nextMaintenance: z.date(),
});

export type DeviceFormValues = z.infer<typeof deviceFormSchema>;
