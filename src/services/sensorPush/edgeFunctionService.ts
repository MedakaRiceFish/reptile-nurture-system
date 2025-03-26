
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
    console.log(`Making ${method} request to SensorPush API at ${path}`);
    
    // Create payload for the edge function
    const payload = {
      path,
      method,
      token,
      body
    };
    
    console.log(`Calling edge function with payload:`, { 
      path, 
      method,
      bodySize: body ? JSON.stringify(body).length : 0,
      hasToken: !!token
    });
    
    // Call the Supabase Edge Function with timeout handling
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Edge function request timed out after 15 seconds")), 15000)
    );
    
    const fetchPromise = supabase.functions.invoke('sensorpush-proxy', {
      body: JSON.stringify(payload)
    });
    
    // Race between fetch and timeout
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from edge function');
    }
    
    // Check if the response contains an error property
    if (data.error) {
      console.error('SensorPush API error:', data.error);
      
      // Handle specific error cases
      if (data.status === 429) {
        throw new Error('Rate limit exceeded. SensorPush allows only 1 request per minute.');
      }
      
      if (data.status === 401 || data.status === 403) {
        throw new Error('Authentication error. Your SensorPush token may have expired. Please reconnect your account.');
      }
      
      throw new Error(`SensorPush API error: ${data.error}`);
    }
    
    // Return the data from the edge function
    return data;
  } catch (error: any) {
    console.error('Error calling SensorPush API via edge function:', error);
    
    // Add more context to the error message
    if (error.message?.includes('fetch failed')) {
      throw new Error('Network error while connecting to SensorPush API. Please check your internet connection.');
    } 
    
    if (error.message?.includes('timed out')) {
      throw new Error('Request to SensorPush API timed out. Please try again later.');
    }
    
    throw error;
  }
};
