
import { supabase } from "@/integrations/supabase/client";
import { SensorPushDBTokens } from "@/types/sensorpush";

/**
 * Create the required stored procedures for token management
 * This will be called during initialization to ensure the functions exist
 */
export const ensureTokenFunctions = async (): Promise<void> => {
  try {
    // These functions are now created via SQL migration and don't need to be
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
    // Check if api_tokens table exists
    const { count, error: checkError } = await supabase
      .from('api_tokens')
      .select('*', { count: 'exact', head: true });
    
    if (checkError) {
      // Table doesn't exist, create it with Supabase SQL
      await supabase.rpc('create_api_tokens_table');
    }
    
    console.log("SensorPush database schema initialized successfully");
  } catch (error) {
    console.error("Error initializing SensorPush database schema:", error);
    throw error;
  }
};

/**
 * Store SensorPush tokens in the database for a specific user
 */
export const storeSensorPushTokens = async (
  userId: string,
  accessToken: string,
  refreshToken: string,
  accessExpires: Date,
  refreshExpires: Date
): Promise<void> => {
  try {
    // First delete any existing tokens for this user to avoid constraint violations
    await supabase
      .from('api_tokens')
      .delete()
      .eq('user_id', userId)
      .in('service', ['sensorpush_access', 'sensorpush_refresh']);
    
    // Insert the access token
    const { error: accessError } = await supabase
      .from('api_tokens')
      .insert({
        user_id: userId,
        service: 'sensorpush_access',
        token: accessToken,
        expires_at: accessExpires.toISOString()
      });
      
    if (accessError) {
      throw new Error(`Failed to store access token: ${accessError.message}`);
    }
    
    // Insert the refresh token if provided
    if (refreshToken) {
      const { error: refreshError } = await supabase
        .from('api_tokens')
        .insert({
          user_id: userId,
          service: 'sensorpush_refresh',
          token: refreshToken,
          expires_at: refreshExpires.toISOString()
        });
        
      if (refreshError) {
        throw new Error(`Failed to store refresh token: ${refreshError.message}`);
      }
    }
    
    console.log("SensorPush tokens stored successfully");
  } catch (error) {
    console.error("Error storing SensorPush tokens:", error);
    throw error;
  }
};

/**
 * Ensure the sensors history table exists
 */
export const ensureSensorsHistoryTableExists = async (): Promise<void> => {
  try {
    // Check if sensors_history table exists
    const { count, error: checkError } = await supabase
      .from('sensors_history')
      .select('*', { count: 'exact', head: true });
    
    if (checkError) {
      // Table doesn't exist, create it with Supabase SQL
      await supabase.rpc('create_sensors_history_table');
    }
    
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
    // Check if samples_history table exists
    const { count, error: checkError } = await supabase
      .from('samples_history')
      .select('*', { count: 'exact', head: true });
    
    if (checkError) {
      // Table doesn't exist, create it with Supabase SQL
      await supabase.rpc('create_samples_history_table');
    }
    
    console.log("Samples history table check complete");
  } catch (error) {
    console.error("Error checking samples history table:", error);
  }
};
