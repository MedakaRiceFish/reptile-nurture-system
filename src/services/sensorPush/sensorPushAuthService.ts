
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SensorPushAuthResponse, SensorPushCredentials, SensorPushTokens, SensorPushDBTokens } from "@/types/sensorpush";
import { BASE_URL, ensureTablesExist, getCurrentUserId } from "./sensorPushBaseService";
import { callSensorPushAPI } from "./edgeFunctionService";

// Track the last API call time to respect rate limiting (1 call per minute)
let lastApiCallTime = 0;
const API_RATE_LIMIT_MS = 60 * 1000; // 1 minute in milliseconds

/**
 * Helper function to enforce rate limiting
 * @returns Promise that resolves when it's safe to make another API call
 */
const enforceRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeElapsed = now - lastApiCallTime;
  
  if (lastApiCallTime > 0 && timeElapsed < API_RATE_LIMIT_MS) {
    const waitTime = API_RATE_LIMIT_MS - timeElapsed;
    console.log(`Rate limiting: waiting ${waitTime}ms before next API call`);
    
    // Wait for the required time
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Update the last API call time
  lastApiCallTime = Date.now();
};

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
    const userId = await getCurrentUserId();
    
    console.log("Storing tokens in database");
    
    try {
      // Store the auth token
      await supabase.rpc('upsert_api_token', {
        p_user_id: userId,
        p_service: 'sensorpush_auth',
        p_token: authResponse.authorization,
        p_expires_at: refreshExpires.toISOString()
      });
      
      // Store the access token
      await supabase.rpc('upsert_api_token', {
        p_user_id: userId,
        p_service: 'sensorpush_access',
        p_token: tokenResponse.accesstoken,
        p_expires_at: accessExpires.toISOString()
      });
      
      // Store the refresh token if we have one
      if (tokenResponse.refreshtoken) {
        await supabase.rpc('upsert_api_token', {
          p_user_id: userId,
          p_service: 'sensorpush_refresh',
          p_token: tokenResponse.refreshtoken,
          p_expires_at: refreshExpires.toISOString()
        });
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
    const userId = await getCurrentUserId();
    
    // Get access token
    const { data: accessTokenData, error: accessError } = await supabase
      .from('api_tokens')
      .select('token, expires_at')
      .eq('user_id', userId)
      .eq('service', 'sensorpush_access')
      .maybeSingle();
      
    if (accessError || !accessTokenData) {
      console.log("No SensorPush access token found");
      return null;
    }
    
    // Get refresh token
    const { data: refreshTokenData, error: refreshError } = await supabase
      .from('api_tokens')
      .select('token, expires_at')
      .eq('user_id', userId)
      .eq('service', 'sensorpush_refresh')
      .maybeSingle();
    
    const now = new Date();
    const accessExpires = new Date(accessTokenData.expires_at);
    
    // If access token is still valid, return it
    if (accessExpires > now) {
      console.log("Using existing access token, expires:", accessExpires.toLocaleString());
      return accessTokenData.token;
    }
    
    // If no refresh token or refresh token is expired, need to re-authenticate
    if (refreshError || !refreshTokenData) {
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
      await supabase.rpc('upsert_api_token', {
        p_user_id: userId,
        p_service: 'sensorpush_access',
        p_token: refreshResponse.accesstoken,
        p_expires_at: newAccessExpires.toISOString()
      });
      
      // Update refresh token if we have one
      if (refreshResponse.refreshtoken) {
        await supabase.rpc('upsert_api_token', {
          p_user_id: userId,
          p_service: 'sensorpush_refresh',
          p_token: refreshResponse.refreshtoken,
          p_expires_at: newRefreshExpires.toISOString()
        });
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
