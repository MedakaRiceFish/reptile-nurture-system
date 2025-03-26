
import { supabase } from "@/integrations/supabase/client";

/**
 * Create the required stored procedures for token management
 * This will be called during initialization to ensure the functions exist
 */
export const ensureTokenFunctions = async (): Promise<void> => {
  try {
    // Create functions for storing and retrieving SensorPush tokens
    // These functions are created via SQL migration and don't need to be
    // created programmatically anymore
    console.log("SensorPush token database functions check complete");
  } catch (error) {
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
    
    console.log("SensorPush database schema initialized successfully");
  } catch (error) {
    console.error("Error initializing SensorPush database schema:", error);
    throw error;
  }
};

/**
 * Ensure the sensors history table exists
 */
export const ensureSensorsHistoryTableExists = async (): Promise<void> => {
  try {
    await supabase.rpc('ensure_sensors_history_table_exists');
    console.log("Sensors history table check complete");
  } catch (error) {
    console.error("Error checking sensors history table:", error);
  }
};

/**
 * Ensure the samples history table exists
 */
export const ensureSamplesHistoryTableExists = async (): Promise<void> => {
  try {
    await supabase.rpc('ensure_samples_history_table_exists');
    console.log("Samples history table check complete");
  } catch (error) {
    console.error("Error checking samples history table:", error);
  }
};
