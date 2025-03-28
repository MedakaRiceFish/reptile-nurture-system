import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SensorPushSample, SensorPushSensor } from "@/types/sensorpush";
import { getCurrentUserId } from "./sensorPushBaseService";
import { getSensorPushToken } from "./sensorPushAuthService";
import { callSensorPushAPI } from "./edgeFunctionService";
import { storeSensorsData, storeSamplesData } from "./sensorPushStorageService";

let stopPolling: (() => void) | null = null;

/**
 * Fetch all sensors from the SensorPush API
 */
export const fetchSensors = async (): Promise<SensorPushSensor[] | null> => {
  try {
    const token = await getSensorPushToken();

    if (!token) {
      toast.error("No SensorPush token found. Please connect your account first.");
      throw new Error("No valid SensorPush token found");
    }

    console.log("Fetching sensors with token length:", token.length);

    // Use the edge function service to make the request
    const data = await callSensorPushAPI('/devices/sensors', token);

    if (!data || !data.sensors) {
      throw new Error("Invalid response from SensorPush API");
    }

    // Log success message with the count of sensors
    console.log(`SensorPush API success: Found ${Object.keys(data.sensors).length} sensors`);

    // Store sensors data in database for historical records
    await storeSensorsData(data.sensors);

    // Convert the object to an array and return
    return Object.values(data.sensors);
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
      toast.error("No SensorPush token found. Please connect your account first.");
      throw new Error("No valid SensorPush token found");
    }

    // Build query parameters according to the documentation
    const params: Record<string, any> = {
      sensors: [sensorId],
      limit
    };

    if (startTime) params.startTime = startTime;
    if (stopTime) params.stopTime = stopTime;

    console.log("Making API request to fetch sensor samples with params:", params);

    // Use the edge function service to make the request
    const data = await callSensorPushAPI('/samples', token, 'POST', params);

    if (!data || !data.sensors) {
      throw new Error("Invalid response from SensorPush API");
    }

    // Log only the count of fetched samples, not the actual data
    if (data.sensors[sensorId]) {
      console.log(`Successfully fetched ${data.sensors[sensorId].length} samples for sensor ${sensorId}`);

      // Store samples data in database for historical analysis
      await storeSamplesData(sensorId, data.sensors[sensorId]);
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
 * Stop the sensor data polling
 */
export const stopSensorDataPolling = (): void => {
  if (stopPolling) {
    stopPolling();
    stopPolling = null;
  }
};

/**
 * Start polling for sensor data every 15 minutes
 * Returns a function to stop the polling
 */
export const startSensorDataPolling = async (): Promise<() => void> => {
  // Stop any existing polling first
  stopSensorDataPolling();

  let isPolling = true;

  const poll = async () => {
    if (!isPolling) return;

    try {
      // Get a valid token (this will refresh if needed)
      const token = await getSensorPushToken();

      if (!token) {
        console.error("No valid SensorPush token available during polling");
        return;
      }

      // Fetch all sensors first
      const sensors = await fetchSensors();

      if (!sensors) {
        console.error("Failed to fetch sensors during polling");
        return;
      }

      // For each sensor, fetch the latest samples
      for (const sensor of sensors) {
        await fetchSensorSamples(sensor.id, 1); // Only fetch the latest sample
      }

      // Schedule next poll in 15 minutes
      setTimeout(poll, 15 * 60 * 1000);
    } catch (error) {
      console.error("Error during sensor data polling:", error);
      // Even if there's an error, continue polling
      setTimeout(poll, 15 * 60 * 1000);
    }
  };

  // Start the polling
  await poll();

  // Store the stop function
  stopPolling = () => {
    isPolling = false;
  };

  return stopPolling;
};

/**
 * Securely clear all cached sensor data and tokens
 * Used when a user logs out or wants to remove their account
 */
export const clearSensorPushData = async (): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();

    // Stop the polling first
    stopSensorDataPolling();

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
