
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Base URL for the SensorPush API
export const BASE_URL = "https://api.sensorpush.com/api/v1";

// Helper function to create tables if they don't exist
export const ensureTablesExist = async () => {
  // Check if api_tokens table exists, if not create it
  const { error: checkApiTokensError } = await supabase
    .from('api_tokens')
    .select('count')
    .limit(1)
    .single();

  if (checkApiTokensError && checkApiTokensError.code === 'PGRST116') {
    // Table doesn't exist, create it with Supabase SQL
    const { error } = await supabase.rpc('create_api_tokens_table');
    if (error) {
      console.error("Failed to create api_tokens table:", error);
    }
  }

  // Check if sensor_mappings table exists, if not create it
  const { error: checkMappingsError } = await supabase
    .from('sensor_mappings')
    .select('count')
    .limit(1)
    .single();

  if (checkMappingsError && checkMappingsError.code === 'PGRST116') {
    // Table doesn't exist, create it with Supabase SQL
    const { error } = await supabase.rpc('create_sensor_mappings_table');
    if (error) {
      console.error("Failed to create sensor_mappings table:", error);
    }
  }
};

// Get the current user ID
export const getCurrentUserId = async (): Promise<string> => {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  return userId;
};
