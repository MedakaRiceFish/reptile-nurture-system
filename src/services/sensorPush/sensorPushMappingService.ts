
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ensureTablesExist, getCurrentUserId } from "./sensorPushBaseService";

/**
 * Map a SensorPush sensor to an enclosure in our database
 */
export const mapSensorToEnclosure = async (sensorId: string, enclosureId: string): Promise<boolean> => {
  try {
    // Ensure required tables exist
    await ensureTablesExist();
    
    const userId = await getCurrentUserId();
    
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
    
    const userId = await getCurrentUserId();
    
    // Use RPC function to get mapped sensor for enclosure
    const { data, error } = await supabase.rpc('get_enclosure_sensor', {
      p_enclosure_id: enclosureId,
      p_user_id: userId
    });

    if (error) {
      throw error;
    }

    return data && data[0] ? data[0].sensor_id : null;
  } catch (error) {
    console.error("Failed to get enclosure sensor:", error);
    return null;
  }
};
