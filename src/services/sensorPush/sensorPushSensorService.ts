
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

    const response = await fetch(`${BASE_URL}/devices/sensors`, {
      method: "GET",
      headers: {
        "Authorization": token
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sensors: ${response.statusText}`);
    }

    const data = await response.json() as SensorPushSensorsResponse;
    
    // Convert the object to an array
    return Object.values(data.sensors);
  } catch (error: any) {
    console.error("Error fetching SensorPush sensors:", error);
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

    const response = await fetch(`${BASE_URL}/samples`, {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch samples: ${response.statusText}`);
    }

    const data = await response.json() as SensorPushSamplesResponse;
    
    // Return the samples for the requested sensor
    return data.sensors[sensorId] || [];
  } catch (error: any) {
    console.error("Error fetching SensorPush samples:", error);
    toast.error(`Failed to fetch sensor readings: ${error.message}`);
    return null;
  }
};
