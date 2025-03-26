
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SensorPushSensor } from "@/types/sensorpush";
import { getCurrentUserId } from "./sensorPushBaseService";

/**
 * Get the sensor ID mapped to an enclosure
 */
export const getEnclosureSensor = async (enclosureId: string): Promise<string | null> => {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase.rpc('get_enclosure_sensor', {
      p_enclosure_id: enclosureId,
      p_user_id: userId
    });
    
    if (error) {
      throw error;
    }
    
    // The database function returns a table, so we need to extract the sensor_id
    if (data && data.length > 0) {
      return data[0].sensor_id;
    }
    
    return null;
  } catch (error: any) {
    console.error("Error getting enclosure sensor:", error.message);
    return null;
  }
};

/**
 * Map a sensor to an enclosure for automatic data updates
 */
export const mapSensorToEnclosure = async (sensorId: string, enclosureId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    // Ensure the sensor_mappings table exists
    await ensureSensorMappingsTableExists();
    
    // Call the RPC function to map the sensor to the enclosure
    const { error } = await supabase.rpc('map_sensor_to_enclosure', {
      p_sensor_id: sensorId,
      p_enclosure_id: enclosureId,
      p_user_id: userId
    });
    
    if (error) {
      throw error;
    }
    
    toast.success("Sensor connected successfully");
    return true;
  } catch (error: any) {
    console.error("Error mapping sensor to enclosure:", error.message);
    toast.error(`Failed to connect sensor: ${error.message}`);
    return false;
  }
};

/**
 * Ensure the sensor_mappings table exists
 */
const ensureSensorMappingsTableExists = async (): Promise<void> => {
  try {
    await supabase.rpc('create_sensor_mappings_table');
  } catch (error) {
    // Table might already exist, that's fine
    console.log("Note: sensor_mappings table might already exist:", error);
  }
};
