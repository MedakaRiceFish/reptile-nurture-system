
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SensorPushCredentials } from "@/types/sensorpush";
import { ensureTablesExist, getCurrentUserId } from "./sensorPushBaseService";
import { callSensorPushAPI } from "./edgeFunctionService";
import { enforceRateLimit } from "./sensorPushRateLimiter";
import { storeApiToken, getApiToken } from "./sensorPushTokenService";

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
    
    // First call - get authorization token
    const authResponse = await callSensorPushAPI('/oauth/authorize', '', 'POST', credentials);
    
    if (!authResponse || !authResponse.authorization) {
      console.error("Invalid auth response:", authResponse);
      throw new Error("Failed to obtain authorization token from SensorPush");
    }
    
    console.log("Authorization token received successfully");
    
    // Calculate time to wait before making the next API call (respecting rate limit)
    await enforceRateLimit();
    
    // Step 2: Use the authorization token to get access and refresh tokens
    console.log("Step 2: Getting access and refresh tokens...");
    const tokenResponse = await callSensorPushAPI('/oauth/accesstoken', '', 'POST', {
      authorization: authResponse.authorization
    });
    
    if (!tokenResponse || !tokenResponse.accesstoken) {
      console.error("Invalid token response:", tokenResponse);
      throw new Error("Failed to obtain access tokens from SensorPush");
    }
    
    if (!tokenResponse.refreshtoken) {
      console.warn("No refresh token in response:", tokenResponse);
      // Continue anyway, as we got an access token
      console.log("No refresh token provided, but proceeding with access token");
    }
    
    console.log("Access token received successfully");
    
    // Calculate expiration dates according to documentation
    // Access token valid for 30 minutes, refresh token for 60 minutes
    const now = new Date();
    const accessExpires = new Date(now.getTime() + 25 * 60 * 1000); // 25 min to be safe
    const refreshExpires = new Date(now.getTime() + 55 * 60 * 1000); // 55 min to be safe
    
    // Store all tokens in the database
    console.log("Storing tokens in database");
    
    try {
      // Store the auth token
      await storeApiToken('sensorpush_auth', authResponse.authorization, refreshExpires);
      
      // Store the access token
      await storeApiToken('sensorpush_access', tokenResponse.accesstoken, accessExpires);
      
      // Store the refresh token if we have one
      if (tokenResponse.refreshtoken) {
        await storeApiToken('sensorpush_refresh', tokenResponse.refreshtoken, refreshExpires);
      }
      
      console.log("Successfully stored tokens in database");
    } catch (storageError) {
      console.error("Error storing tokens:", storageError);
      throw new Error("Failed to store SensorPush tokens");
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
    // Get access token
    const accessTokenData = await getApiToken('sensorpush_access');
      
    if (!accessTokenData) {
      console.log("No SensorPush access token found");
      return null;
    }
    
    // Get refresh token
    const refreshTokenData = await getApiToken('sensorpush_refresh');
    
    const now = new Date();
    const accessExpires = new Date(accessTokenData.expires_at);
    
    // If access token is still valid, return it
    if (accessExpires > now) {
      console.log("Using existing access token, expires:", accessExpires.toLocaleString());
      return accessTokenData.token;
    }
    
    // If no refresh token or refresh token is expired, need to re-authenticate
    if (!refreshTokenData) {
      console.log("No refresh token found, need to re-authenticate");
      return null;
    }
    
    const refreshExpires = new Date(refreshTokenData.expires_at);
    if (refreshExpires <= now) {
      console.log("Refresh token expired, need to re-authenticate");
      return null;
    }
    
    // Access token expired but refresh token valid, attempt to refresh
    console.log("Access token expired, refreshing using refresh token");
    
    try {
      // Enforce rate limiting
      await enforceRateLimit();
      
      const refreshResponse = await callSensorPushAPI('/oauth/refreshtoken', '', 'POST', {
        refreshtoken: refreshTokenData.token
      });
      
      if (!refreshResponse || !refreshResponse.accesstoken) {
        console.error("Invalid refresh response:", refreshResponse);
        throw new Error("Failed to refresh SensorPush tokens");
      }
      
      // Calculate new expiration dates
      const newAccessExpires = new Date(now.getTime() + 25 * 60 * 1000); // 25 min
      const newRefreshExpires = new Date(now.getTime() + 55 * 60 * 1000); // 55 min
      
      // Update access token in the database
      await storeApiToken('sensorpush_access', refreshResponse.accesstoken, newAccessExpires);
      
      // Update refresh token if we have one
      if (refreshResponse.refreshtoken) {
        await storeApiToken('sensorpush_refresh', refreshResponse.refreshtoken, newRefreshExpires);
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
