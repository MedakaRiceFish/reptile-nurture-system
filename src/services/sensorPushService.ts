
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

/**
 * Authenticate with the SensorPush API and store the authorization token
 */
export const authenticateSensorPush = async (credentials: SensorPushCredentials): Promise<string | null> => {
  try {
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
    const { error: storageError } = await supabase
      .from('api_tokens')
      .upsert({
        service: 'sensorpush',
        token: authorization,
        expires_at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // Token expires in 24 hours
        user_id: (await supabase.auth.getUser()).data.user?.id
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
    
    const { data, error } = await supabase
      .from('api_tokens')
      .select('token, expires_at')
      .eq('service', 'sensorpush')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!data || new Date(data.expires_at) < new Date()) {
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
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('sensor_mappings')
      .upsert({
        sensor_id: sensorId,
        enclosure_id: enclosureId,
        user_id: userId,
        updated_at: new Date().toISOString()
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
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('sensor_mappings')
      .select('sensor_id')
      .eq('enclosure_id', enclosureId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data?.sensor_id || null;
  } catch (error) {
    console.error("Failed to get enclosure sensor:", error);
    return null;
  }
};
