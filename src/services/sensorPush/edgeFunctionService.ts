
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Function to make a request to the SensorPush API through the Supabase Edge Function
 */
export const callSensorPushAPI = async (
  path: string, 
  token: string, 
  method: "GET" | "POST" = "GET", 
  body?: any
): Promise<any> => {
  try {
    // Create payload for the edge function
    const payload = {
      path,
      method,
      token,
      body
    };
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('sensorpush-proxy', {
      body: JSON.stringify(payload)
    });
    
    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    // Return the data from the edge function
    return data;
  } catch (error: any) {
    console.error('Error calling SensorPush API via edge function:', error);
    throw error;
  }
};
