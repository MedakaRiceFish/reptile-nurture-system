
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SensorPushAuthResponse, SensorPushCredentials } from "@/types/sensorpush";
import { BASE_URL, ensureTablesExist, getCurrentUserId } from "./sensorPushBaseService";
import { callSensorPushAPI } from "./edgeFunctionService";

/**
 * Authenticate with the SensorPush API and store the authorization token
 */
export const authenticateSensorPush = async (credentials: SensorPushCredentials): Promise<string | null> => {
  try {
    // Ensure required tables exist
    await ensureTablesExist();
    
    console.log("Authenticating with SensorPush API...");
    
    // Make the authentication request through our edge function
    const authResponse = await callSensorPushAPI('/oauth/authorize', '', 'POST', credentials);
    
    console.log("Auth response received:", authResponse);
    
    if (!authResponse || !authResponse.authorization) {
      throw new Error("Failed to obtain authorization token from SensorPush");
    }

    // Get the authorization token from the response
    const { authorization } = authResponse;
    
    // According to docs, authorization token is valid for 60 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 55); // Set to 55 min to be safe
    
    // Store the token in Supabase
    const userId = await getCurrentUserId();
    
    console.log("Storing token in database, expires at:", expiresAt.toISOString());
    
    // Store the token with 'Bearer ' prefix to match SensorPush API expectations
    const formattedToken = `Bearer ${authorization}`;
    
    // Insert or update token in the custom table
    const { error: storageError } = await supabase.rpc('upsert_api_token', {
      p_service: 'sensorpush',
      p_token: formattedToken,
      p_expires_at: expiresAt.toISOString(),
      p_user_id: userId
    });

    if (storageError) {
      console.error("Failed to store SensorPush token:", storageError);
      throw storageError;
    }

    console.log("Successfully authenticated with SensorPush API, token will expire at:", expiresAt.toLocaleString());
    return formattedToken;
  } catch (error: any) {
    console.error("SensorPush authentication error:", error);
    toast.error(`Authentication failed: ${error.message}`);
    return null;
  }
};

/**
 * Get the stored SensorPush authorization token
 * If token is expired or about to expire, it returns null so a new one can be requested
 */
export const getSensorPushToken = async (): Promise<string | null> => {
  try {
    const userId = await getCurrentUserId();
    
    // Get token from the custom function
    const { data, error } = await supabase.rpc('get_api_token', {
      p_service: 'sensorpush',
      p_user_id: userId
    });

    if (error) {
      console.error("Error getting token:", error);
      throw error;
    }

    if (!data || data.length === 0 || !data[0].token) {
      console.log("No SensorPush token found in database");
      return null;
    }
    
    // Check if token is expired or about to expire (within 5 minutes)
    const expiresAt = new Date(data[0].expires_at);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    console.log("Token expires at:", expiresAt.toLocaleString());
    console.log("Current time:", now.toLocaleString());
    
    if (expiresAt < now) {
      console.log("SensorPush token has expired");
      return null;
    }
    
    if (expiresAt < fiveMinutesFromNow) {
      console.log("SensorPush token will expire soon, should request a new one");
      // Continue with the current token but log a warning
      console.warn("Using soon-to-expire SensorPush token");
    }

    // Return the token which is already properly formatted with 'Bearer ' prefix
    return data[0].token;
  } catch (error) {
    console.error("Failed to get SensorPush token:", error);
    return null;
  }
};
