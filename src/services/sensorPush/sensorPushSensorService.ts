
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SensorPushSample, SensorPushSamplesResponse, SensorPushSensor, SensorPushSensorsResponse } from "@/types/sensorpush";
import { BASE_URL, ensureTablesExist, getCurrentUserId } from "./sensorPushBaseService";
import { getSensorPushToken } from "./sensorPushAuthService";

/**
 * Fetch all sensors from the SensorPush API
 */
export const fetchSensors = async (): Promise<SensorPushSensor[] | null> => {
  try {
    const token = await getSensorPushToken();
    
    if (!token) {
      throw new Error("No valid SensorPush token found");
    }

    // Log redacted token for debugging (showing only first few characters)
    const redactedToken = token.substring(0, 5) + "...";
    console.log("Fetching sensors with token:", redactedToken);
    
    // Create current date for AWS Signature v4
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);
    
    // Make the request to SensorPush API with proper AWS signature format
    const response = await fetch(`${BASE_URL}/devices/sensors`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Amz-Date": amzDate
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SensorPush API error:", errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as SensorPushSensorsResponse;
    
    // Log only the success response and count, not the full payload
    console.log(`SensorPush API response: Successfully fetched ${Object.keys(data.sensors).length} sensors`);
    
    // Sanitize sensitive data before returning it
    const sanitizedSensors = Object.values(data.sensors).map(sensor => ({
      ...sensor,
      // Redact any potentially sensitive information
      address: sensor.address ? `${sensor.address.substring(0, 5)}...` : sensor.address
    }));
    
    // Convert the object to an array with sanitized data
    return sanitizedSensors;
  } catch (error: any) {
    console.error("Error fetching SensorPush sensors:", error.message);
    toast.error(`Failed to fetch sensors: ${error.message}`);
    return null;
  }
};

/**
 * Fetch samples (readings) for a specific sensor
 */
export const fetchSensorSamples = async (
  sensorId: string,
  limit: number = 100,
  startTime?: string,
  stopTime?: string
): Promise<SensorPushSample[] | null> => {
  try {
    const token = await getSensorPushToken();
    
    if (!token) {
      throw new Error("No valid SensorPush token found");
    }

    // Build query parameters
    const params: Record<string, any> = {
      sensors: [sensorId],
      limit
    };

    if (startTime) params.startTime = startTime;
    if (stopTime) params.stopTime = stopTime;

    // Create current date for AWS Signature v4
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    const response = await fetch(`${BASE_URL}/samples`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Amz-Date": amzDate
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SensorPush API error:", errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as SensorPushSamplesResponse;
    
    // Log only the count of fetched samples, not the actual data
    if (data.sensors[sensorId]) {
      console.log(`Successfully fetched ${data.sensors[sensorId].length} samples for sensor ${sensorId}`);
    } else {
      console.log(`No samples found for sensor ${sensorId}`);
    }
    
    // Return the samples for the requested sensor
    return data.sensors[sensorId] || [];
  } catch (error: any) {
    console.error("Error fetching SensorPush samples:", error.message);
    toast.error(`Failed to fetch sensor readings: ${error.message}`);
    return null;
  }
};

/**
 * Securely clear all cached sensor data and tokens
 * Used when a user logs out or wants to remove their account
 */
export const clearSensorPushData = async (): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    // Delete the token from the database
    const { error } = await supabase
      .from('api_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('service', 'sensorpush');
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error clearing SensorPush data:", error.message);
    return false;
  }
};
