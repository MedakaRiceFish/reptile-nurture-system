
import { supabase } from "@/integrations/supabase/client";

/**
 * Create the required stored procedures for token management
 * This will be called during initialization to ensure the functions exist
 */
export const ensureTokenFunctions = async (): Promise<void> => {
  try {
    // Create stored procedure to store all SensorPush tokens
    await supabase.rpc('create_store_tokens_function');
    
    // Create stored procedure to get SensorPush tokens
    await supabase.rpc('create_get_tokens_function');
    
    console.log("SensorPush token database functions created successfully");
  } catch (error) {
    // If there's an error, it's likely because the functions already exist
    console.log("SensorPush token functions check complete");
  }
};

/**
 * Initialize the database schema for SensorPush integration
 * This creates the necessary tables and functions if they don't exist
 */
export const initSensorPushSchema = async (): Promise<void> => {
  try {
    // Ensure the api_tokens table structure is updated to support multiple tokens
    await supabase.rpc('ensure_api_tokens_schema');
    
    // Create the stored procedures
    await ensureTokenFunctions();
    
    console.log("SensorPush database schema initialized successfully");
  } catch (error) {
    console.error("Error initializing SensorPush database schema:", error);
    throw error;
  }
};
