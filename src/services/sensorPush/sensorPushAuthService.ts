
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SensorPushAuthResponse, SensorPushCredentials } from "@/types/sensorpush";
import { BASE_URL, ensureTablesExist, getCurrentUserId } from "./sensorPushBaseService";

/**
 * Authenticate with the SensorPush API and store the authorization token
 */
export const authenticateSensorPush = async (credentials: SensorPushCredentials): Promise<string | null> => {
  try {
    // Ensure required tables exist
    await ensureTablesExist();
    
    // First, get an oauth token
    const oauthResponse = await fetch(`${BASE_URL}/oauth/authorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials)
    });

    if (!oauthResponse.ok) {
      const error = await oauthResponse.json();
      throw new Error(error.message || "Failed to authenticate with SensorPush");
    }

    const { authorization } = await oauthResponse.json() as SensorPushAuthResponse;
    
    // Store the token in Supabase
    const userId = await getCurrentUserId();
    
    // Insert or update token in the custom table
    const { error: storageError } = await supabase.rpc('upsert_api_token', {
      p_service: 'sensorpush',
      p_token: authorization,
      p_expires_at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
      p_user_id: userId
    });

    if (storageError) {
      console.error("Failed to store SensorPush token:", storageError);
      throw storageError;
    }

    return authorization;
  } catch (error: any) {
    console.error("SensorPush authentication error:", error);
    toast.error(`Authentication failed: ${error.message}`);
    return null;
  }
};

/**
 * Get the stored SensorPush authorization token
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
      throw error;
    }

    if (!data || !data[0] || !data[0].token || new Date(data[0].expires_at) < new Date()) {
      // Token has expired or doesn't exist
      return null;
    }

    return data[0].token;
  } catch (error) {
    console.error("Failed to get SensorPush token:", error);
    return null;
  }
};
