
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  SensorPushAuthResponse,
  SensorPushCredentials,
  SensorPushSample,
  SensorPushSamplesResponse,
  SensorPushSensor,
  SensorPushSensorsResponse
} from "@/types/sensorpush";

// Base URL for the SensorPush API
const BASE_URL = "https://api.sensorpush.com/api/v1";

// Helper function to create tables if they don't exist
const ensureTablesExist = async () => {
  // Check if api_tokens table exists, if not create it
  const { error: checkApiTokensError } = await supabase
    .from('api_tokens')
    .select('count')
    .limit(1)
    .single();

  if (checkApiTokensError && checkApiTokensError.code === 'PGRST116') {
    // Table doesn't exist, create it with Supabase SQL
    const { error } = await supabase.rpc('create_api_tokens_table');
    if (error) {
      console.error("Failed to create api_tokens table:", error);
    }
  }

  // Check if sensor_mappings table exists, if not create it
  const { error: checkMappingsError } = await supabase
    .from('sensor_mappings')
    .select('count')
    .limit(1)
    .single();

  if (checkMappingsError && checkMappingsError.code === 'PGRST116') {
    // Table doesn't exist, create it with Supabase SQL
    const { error } = await supabase.rpc('create_sensor_mappings_table');
    if (error) {
      console.error("Failed to create sensor_mappings table:", error);
    }
  }
};

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
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
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
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Get token from the custom function
    const { data, error } = await supabase.rpc('get_api_token', {
      p_service: 'sensorpush',
      p_user_id: userId
    });

    if (error) {
      throw error;
    }

    if (!data || !data.token || new Date(data.expires_at) < new Date()) {
      // Token has expired or doesn't exist
      return null;
    }

    return data.token;
  } catch (error) {
    console.error("Failed to get SensorPush token:", error);
    return null;
  }
};

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

/**
 * Map a SensorPush sensor to an enclosure in our database
 */
export const mapSensorToEnclosure = async (sensorId: string, enclosureId: string): Promise<boolean> => {
  try {
    // Ensure required tables exist
    await ensureTablesExist();
    
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Use RPC function to map sensor to enclosure
    const { error } = await supabase.rpc('map_sensor_to_enclosure', {
      p_sensor_id: sensorId,
      p_enclosure_id: enclosureId,
      p_user_id: userId
    });

    if (error) {
      throw error;
    }

    toast.success("Sensor mapped to enclosure successfully");
    return true;
  } catch (error: any) {
    console.error("Failed to map sensor to enclosure:", error);
    toast.error(`Failed to map sensor: ${error.message}`);
    return false;
  }
};

/**
 * Get the sensor ID mapped to a specific enclosure
 */
export const getEnclosureSensor = async (enclosureId: string): Promise<string | null> => {
  try {
    // Ensure required tables exist
    await ensureTablesExist();
    
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Use RPC function to get mapped sensor for enclosure
    const { data, error } = await supabase.rpc('get_enclosure_sensor', {
      p_enclosure_id: enclosureId,
      p_user_id: userId
    });

    if (error) {
      throw error;
    }

    return data?.sensor_id || null;
  } catch (error) {
    console.error("Failed to get enclosure sensor:", error);
    return null;
  }
};
