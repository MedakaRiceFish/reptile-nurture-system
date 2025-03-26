
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SensorPushAuthResponse, SensorPushCredentials, SensorPushTokens, SensorPushDBTokens } from "@/types/sensorpush";
import { BASE_URL, ensureTablesExist, getCurrentUserId } from "./sensorPushBaseService";
import { callSensorPushAPI } from "./edgeFunctionService";

/**
 * Authenticate with the SensorPush API and store the authorization token
 * This implements SensorPush's OAuth2 flow
 */
export const authenticateSensorPush = async (credentials: SensorPushCredentials): Promise<string | null> => {
  try {
    // Ensure required tables exist
    await ensureTablesExist();
    
    console.log("Starting SensorPush OAuth flow...");
    
    // Step 1: Get an authorization token by providing email/password credentials
    console.log("Step 1: Getting authorization token...");
    const authResponse = await callSensorPushAPI('/oauth/authorize', '', 'POST', credentials);
    
    if (!authResponse || !authResponse.authorization) {
      console.error("Invalid auth response:", authResponse);
      throw new Error("Failed to obtain authorization token from SensorPush");
    }
    
    console.log("Authorization token received successfully");
    
    // Step 2: Use the authorization token to get access and refresh tokens
    console.log("Step 2: Getting access and refresh tokens...");
    const tokenResponse = await callSensorPushAPI('/oauth/accesstoken', '', 'POST', {
      authorization: authResponse.authorization
    });
    
    if (!tokenResponse || !tokenResponse.accesstoken || !tokenResponse.refreshtoken) {
      console.error("Invalid token response:", tokenResponse);
      throw new Error("Failed to obtain access tokens from SensorPush");
    }
    
    console.log("Access and refresh tokens received successfully");
    
    // Calculate expiration dates according to documentation
    // Access token valid for 30 minutes, refresh token for 60 minutes
    const now = new Date();
    const accessExpires = new Date(now.getTime() + 25 * 60 * 1000); // 25 min to be safe
    const refreshExpires = new Date(now.getTime() + 55 * 60 * 1000); // 55 min to be safe
    
    // Store all tokens in the database
    const userId = await getCurrentUserId();
    
    console.log("Storing tokens in database");
    
    // Store the tokens in Supabase using the custom function
    const { error: storageError } = await supabase.rpc('store_sensorpush_tokens', {
      p_user_id: userId,
      p_auth_token: authResponse.authorization,
      p_access_token: tokenResponse.accesstoken,
      p_refresh_token: tokenResponse.refreshtoken,
      p_access_expires: accessExpires.toISOString(),
      p_refresh_expires: refreshExpires.toISOString()
    });

    if (storageError) {
      console.error("Failed to store SensorPush tokens:", storageError);
      throw storageError;
    }

    console.log("Successfully authenticated with SensorPush API");
    
    // Return the access token for immediate use
    return tokenResponse.accesstoken;
  } catch (error: any) {
    console.error("SensorPush authentication error:", error);
    toast.error(`Authentication failed: ${error.message}`);
    return null;
  }
};

/**
 * Get the current valid SensorPush access token
 * If the access token is expired but the refresh token is valid, it will refresh automatically
 * If both are expired, it returns null so a new authentication can be performed
 */
export const getSensorPushToken = async (): Promise<string | null> => {
  try {
    const userId = await getCurrentUserId();
    
    // Get tokens from Supabase using the custom function
    const { data, error } = await supabase.rpc('get_sensorpush_tokens', {
      p_user_id: userId
    });

    if (error) {
      console.error("Error getting SensorPush tokens:", error);
      throw error;
    }

    if (!data || !data[0] || !data[0].access_token) {
      console.log("No SensorPush tokens found");
      return null;
    }
    
    const tokens = data[0] as SensorPushDBTokens;
    
    const now = new Date();
    const accessExpires = new Date(tokens.access_expires);
    const refreshExpires = new Date(tokens.refresh_expires);
    
    // If access token is still valid, return it
    if (accessExpires > now) {
      console.log("Using existing access token, expires:", accessExpires.toLocaleString());
      return tokens.access_token;
    }
    
    // If refresh token is expired too, need to re-authenticate
    if (refreshExpires <= now) {
      console.log("All tokens expired, need to re-authenticate");
      return null;
    }
    
    // Access token expired but refresh token valid, attempt to refresh
    console.log("Access token expired, refreshing using refresh token");
    
    try {
      const refreshResponse = await callSensorPushAPI('/oauth/refreshtoken', '', 'POST', {
        refreshtoken: tokens.refresh_token
      });
      
      if (!refreshResponse || !refreshResponse.accesstoken || !refreshResponse.refreshtoken) {
        console.error("Invalid refresh response:", refreshResponse);
        throw new Error("Failed to refresh SensorPush tokens");
      }
      
      // Calculate new expiration dates
      const newAccessExpires = new Date(now.getTime() + 25 * 60 * 1000); // 25 min
      const newRefreshExpires = new Date(now.getTime() + 55 * 60 * 1000); // 55 min
      
      // Update tokens in the database
      const { error: updateError } = await supabase.rpc('store_sensorpush_tokens', {
        p_user_id: userId,
        p_auth_token: tokens.auth_token, // Keep existing auth token
        p_access_token: refreshResponse.accesstoken,
        p_refresh_token: refreshResponse.refreshtoken,
        p_access_expires: newAccessExpires.toISOString(),
        p_refresh_expires: newRefreshExpires.toISOString()
      });
      
      if (updateError) {
        console.error("Failed to update refreshed tokens:", updateError);
        throw updateError;
      }
      
      console.log("Successfully refreshed SensorPush tokens");
      return refreshResponse.accesstoken;
    } catch (refreshError) {
      console.error("Error refreshing tokens:", refreshError);
      return null;
    }
  } catch (error) {
    console.error("Failed to get SensorPush token:", error);
    return null;
  }
};
