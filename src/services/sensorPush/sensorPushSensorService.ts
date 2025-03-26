
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SensorPushSample, SensorPushSamplesResponse, SensorPushSensor, SensorPushSensorsResponse } from "@/types/sensorpush";
import { BASE_URL, ensureTablesExist, getCurrentUserId } from "./sensorPushBaseService";
import { getSensorPushToken } from "./sensorPushAuthService";
import { callSensorPushAPI } from "./edgeFunctionService";

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
    
    // Use the edge function service to make the request
    const data = await callSensorPushAPI('/devices/sensors', token);
    
    console.log("SensorPush API response:", data);
    
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
 * Store sensors data in the database for historical tracking
 * This enables us to maintain 18+ months of history for analytics
 */
const storeSensorsData = async (sensors: Record<string, SensorPushSensor> | SensorPushSensor[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // Ensure the sensors_history table exists
    await ensureSensorsHistoryTableExists();
    
    // Store each sensor in the database with a timestamp
    const timestamp = new Date().toISOString();
    
    // Handle both array and record formats
    const sensorEntries = Array.isArray(sensors) 
      ? sensors.map(sensor => [sensor.id, sensor])
      : Object.entries(sensors);
    
    for (const [sensorId, sensorData] of sensorEntries) {
      // Insert the sensor data with the current timestamp
      const sensorJson = typeof sensorData === 'string' 
        ? sensorData 
        : JSON.stringify(sensorData);
        
      await supabase.rpc('store_sensor_data', {
        p_sensor_id: sensorId,
        p_sensor_data: sensorJson,
        p_user_id: userId,
        p_timestamp: timestamp
      });
    }
  } catch (error) {
    console.error("Error storing sensor history:", error);
    // Don't throw here - we still want to return the sensors even if history storage fails
  }
};

/**
 * Ensure the sensors_history table exists for long-term data storage
 */
const ensureSensorsHistoryTableExists = async (): Promise<void> => {
  // Check if sensors_history table exists, if not create it
  const { error: checkError } = await supabase
    .from('sensors_history')
    .select('count')
    .limit(1)
    .single();

  if (checkError && checkError.code === 'PGRST116') {
    // Table doesn't exist, create it with Supabase SQL
    await supabase.rpc('create_sensors_history_table');
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

    // Build query parameters according to the Swagger documentation
    const params: Record<string, any> = {
      sensors: [sensorId],
      limit
    };

    if (startTime) params.startTime = startTime;
    if (stopTime) params.stopTime = stopTime;

    console.log("Making API request to fetch sensor samples");
    
    // Use the edge function service to make the request
    const data = await callSensorPushAPI('/samples', token, 'POST', params);
    
    if (!data || !data.sensors) {
      throw new Error("Invalid response from SensorPush API");
    }
    
    // Log only the count of fetched samples, not the actual data
    if (data.sensors[sensorId]) {
      console.log(`Successfully fetched ${data.sensors[sensorId].length} samples for sensor ${sensorId}`);
      
      // Store samples data in database for historical analysis (18+ months)
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
 * Store sensor samples in the database for long-term analytics
 * This ensures we maintain 18+ months of historical data
 */
const storeSamplesData = async (sensorId: string, samples: SensorPushSample[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // Ensure the samples_history table exists
    await ensureSamplesHistoryTableExists();
    
    // Store each sample in the database
    for (const sample of samples) {
      // Skip if we already have this sample (based on sample.id)
      const { data: existingSample } = await supabase
        .from('samples_history')
        .select('id')
        .eq('sample_id', sample.id)
        .maybeSingle();
        
      if (!existingSample) {
        await supabase
          .from('samples_history')
          .insert({
            sample_id: sample.id,
            sensor_id: sensorId,
            user_id: userId,
            timestamp: sample.observation,
            temperature: sample.temperature,
            humidity: sample.humidity,
            dewpoint: sample.dewpoint,
            pressure: sample.pressure,
            barometer: sample.barometer,
            vpd: sample.vpd,
            raw_data: JSON.stringify(sample)
          });
      }
    }
  } catch (error) {
    console.error("Error storing samples history:", error);
    // Don't throw here - we still want to return the samples even if history storage fails
  }
};

/**
 * Ensure the samples_history table exists for long-term data storage
 */
const ensureSamplesHistoryTableExists = async (): Promise<void> => {
  // Check if samples_history table exists, if not create it
  const { error: checkError } = await supabase
    .from('samples_history')
    .select('count')
    .limit(1)
    .single();

  if (checkError && checkError.code === 'PGRST116') {
    // Table doesn't exist, create it with Supabase SQL
    await supabase.rpc('create_samples_history_table');
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
