
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { initSensorPushSchema } from "./sensorPushDatabaseService";

// Base URL for the SensorPush API
export const BASE_URL = "https://api.sensorpush.com/api/v1";

// Helper function to create tables if they don't exist
export const ensureTablesExist = async () => {
  try {
    // Initialize the database schema
    await initSensorPushSchema();
    
    // Check if api_tokens table exists
    const { error: checkApiTokensError } = await supabase
      .from('api_tokens')
      .select('count')
      .limit(1)
      .single();

    if (checkApiTokensError && checkApiTokensError.code === 'PGRST116') {
      // Table doesn't exist, create it with direct SQL
      const { error } = await supabase.rpc('create_api_tokens_table');
      if (error) {
        console.error("Failed to create api_tokens table:", error);
        throw error;
      }
    }

    // Check if sensor_mappings table exists
    const { error: checkMappingsError } = await supabase
      .from('sensor_mappings')
      .select('count')
      .limit(1)
      .single();

    if (checkMappingsError && checkMappingsError.code === 'PGRST116') {
      // Table doesn't exist, create it
      const { error } = await supabase.rpc('create_sensor_mappings_table');
      if (error) {
        console.error("Failed to create sensor_mappings table:", error);
        throw error;
      }
    }
    
    console.log("Tables checked successfully");
  } catch (error) {
    console.error("Error ensuring tables exist:", error);
    throw error;
  }
};

// Get the current user ID
export const getCurrentUserId = async (): Promise<string> => {
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    return userId;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    throw error;
  }
};
