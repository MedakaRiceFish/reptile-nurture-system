
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
    try {
      console.log("Making real API request to SensorPush API");
      const response = await fetch(`${BASE_URL}/devices/sensors`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Amz-Date": amzDate
        }
      });

      // Improved error handling with detailed logging
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`SensorPush API error: Status ${response.status}`, errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as SensorPushSensorsResponse;
      
      // Log success message with the count of sensors
      console.log(`SensorPush API success: Found ${Object.keys(data.sensors).length} sensors`);
      
      // Store sensors data in database for historical records
      await storeSensorsData(data.sensors);
      
      // Convert the object to an array and return
      return Object.values(data.sensors);
    } catch (error: any) {
      console.error("Error making API request:", error.message);
      throw error; // Rethrow to handle in the main try/catch
    }
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
      await supabase.rpc('store_sensor_data', {
        p_sensor_id: sensorId,
        p_sensor_data: JSON.stringify(sensorData),
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

    // Create current date for AWS Signature v4
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    
    console.log("Making real API request to fetch sensor samples");
    
    try {
      // According to Swagger, this is a POST request to /samples
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

      // Improved error handling with detailed logging
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`SensorPush API error: Status ${response.status}`, errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as SensorPushSamplesResponse;
      
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
    } catch (error) {
      console.error("Error making API request for samples:", error);
      throw error; // Rethrow to handle in the main try/catch
    }
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
