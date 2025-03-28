
import { SensorPushCredentials, SensorPushTokens } from "@/types/sensorpush";
import { getRateLimitedFunction } from "./sensorPushRateLimiter";
import { authenticateSensorPushWithCredentials, callSensorPushAPI } from "./edgeFunctionService";
import { storeSensorPushTokens } from "./sensorPushDatabaseService";
import { getCurrentUserId } from "./sensorPushBaseService";
import { supabase } from "@/integrations/supabase/client";
import { startSensorDataPolling } from "./sensorPushFetchService";

// Limit authentication to once per 30 seconds
const throttledAuthenticate = getRateLimitedFunction(
  authenticateSensorPushWithCredentials,
  30000
);

/**
 * Authenticate with SensorPush API and store the tokens
 */
export const authenticateSensorPush = async (
  credentials: SensorPushCredentials
): Promise<string | null> => {
  try {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    console.log("Starting SensorPush authentication...");

    // Use the rate-limited version to prevent too many requests
    const tokens = await throttledAuthenticate(email, password);

    if (!tokens || !tokens.accesstoken) {
      throw new Error("Failed to obtain authentication tokens from SensorPush");
    }

    // Get current user ID to store tokens
    const userId = await getCurrentUserId();

    // Calculate token expiration dates (30 minutes for access token, 24 hours for refresh token)
    const now = new Date();
    const accessExpires = new Date(now.getTime() + 30 * 60000); // 30 minutes
    const refreshExpires = new Date(now.getTime() + 24 * 60 * 60000); // 24 hours

    // Store the tokens in the database
    await storeSensorPushTokens(
      userId,
      tokens.accesstoken,
      tokens.refreshtoken,
      accessExpires,
      refreshExpires,
      tokens.apikey
    );

    // Start polling for sensor data
    await startSensorDataPolling();

    console.log("SensorPush authentication successful");
    return tokens.accesstoken;
  } catch (error: any) {
    console.error("SensorPush authentication error:", error);
    throw new Error(`Failed to authenticate with SensorPush: ${error.message}`);
  }
};

/**
 * Get the SensorPush access token - either from the local storage or refresh if needed
 */
export const getSensorPushToken = async (): Promise<string | null> => {
  try {
    // First try to get the token from storage
    const userId = await getCurrentUserId();

    // This function gets tokens from the database
    const tokensResult = await getSensorPushTokensFromDatabase(userId);

    if (!tokensResult) {
      console.log("No SensorPush tokens found");
      return null;
    }

    const now = new Date();
    const accessExpires = new Date(tokensResult.access_expires);
    const refreshExpires = new Date(tokensResult.refresh_expires);

    // If the access token is still valid, return it
    if (tokensResult.access_token && accessExpires > now) {
      console.log("Using existing SensorPush access token");
      return tokensResult.access_token;
    }

    // If the refresh token is still valid, use it to get a new access token
    if (tokensResult.refresh_token && refreshExpires > now) {
      console.log("Refreshing SensorPush access token...");
      return await refreshAccessToken(tokensResult.refresh_token);
    }

    // If we got here, all tokens are expired
    console.log("All SensorPush tokens are expired");
    return null;
  } catch (error) {
    console.error("Error getting SensorPush token:", error);
    return null;
  }
};

/**
 * Refresh the access token using the refresh token
 */
const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const response = await callSensorPushAPI("/oauth/refreshtoken", "", "POST", {
      refreshtoken: refreshToken
    });

    if (!response || !response.accesstoken) {
      throw new Error("Failed to refresh access token");
    }

    const userId = await getCurrentUserId();

    // Calculate token expiration dates (30 minutes for access token, 24 hours for refresh token)
    const now = new Date();
    const accessExpires = new Date(now.getTime() + 30 * 60000); // 30 minutes
    const refreshExpires = new Date(now.getTime() + 24 * 60 * 60000); // 24 hours

    // Store the new tokens
    await storeSensorPushTokens(
      userId,
      response.accesstoken,
      response.refreshtoken || refreshToken,
      accessExpires,
      refreshExpires
    );

    return response.accesstoken;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
};

/**
 * Get the SensorPush tokens from the database
 */
const getSensorPushTokensFromDatabase = async (userId: string): Promise<{
  auth_token: string;
  access_token: string;
  refresh_token: string;
  access_expires: string;
  refresh_expires: string;
} | null> => {
  try {
    // Call the database function to get SensorPush tokens
    const { data, error } = await supabase.rpc('get_sensorpush_tokens', {
      p_user_id: userId
    });

    if (error || !data) {
      console.log("No SensorPush tokens found in database:", error?.message);
      return null;
    }

    // Handle the response - data is an array from the RPC function
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    console.log("Unexpected data format from get_sensorpush_tokens:", data);
    return null;
  } catch (error) {
    console.error("Error getting SensorPush tokens from database:", error);
    return null;
  }
};
