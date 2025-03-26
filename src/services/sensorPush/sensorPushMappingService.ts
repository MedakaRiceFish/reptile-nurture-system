
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentUserId } from "./sensorPushBaseService";

/**
 * Map a sensor to an enclosure
 */
export const mapSensorToEnclosure = async (sensorId: string, enclosureId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    // First check if there's already a mapping for this enclosure
    const { data: existingMapping } = await supabase
      .from('sensor_mappings')
      .select('id')
      .eq('enclosure_id', enclosureId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingMapping) {
      // Update existing mapping
      const { error } = await supabase
        .from('sensor_mappings')
        .update({ sensor_id: sensorId })
        .eq('id', existingMapping.id);
      
      if (error) throw error;
    } else {
      // Create new mapping
      const { error } = await supabase
        .from('sensor_mappings')
        .insert({
          sensor_id: sensorId,
          enclosure_id: enclosureId,
          user_id: userId
        });
      
      if (error) throw error;
    }
    
    toast.success("Sensor connected to enclosure successfully");
    return true;
  } catch (error: any) {
    console.error("Error mapping sensor to enclosure:", error.message);
    toast.error(`Failed to connect sensor: ${error.message}`);
    return false;
  }
};

/**
 * Get the sensor ID mapped to an enclosure
 */
export const getEnclosureSensor = async (enclosureId: string): Promise<string | null> => {
  try {
    const userId = await getCurrentUserId();
    
    // Check if there's a mapping for this enclosure
    const { data, error } = await supabase
      .from('sensor_mappings')
      .select('sensor_id')
      .eq('enclosure_id', enclosureId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    // Return the sensor ID if one exists, otherwise null
    return data?.sensor_id || null;
  } catch (error: any) {
    console.error("Error getting enclosure sensor mapping:", error.message);
    return null;
  }
};

/**
 * Get all enclosures mapped to a sensor
 */
export const getSensorEnclosures = async (sensorId: string): Promise<string[] | null> => {
  try {
    const userId = await getCurrentUserId();
    
    // Get all enclosures mapped to this sensor
    const { data, error } = await supabase
      .from('sensor_mappings')
      .select('enclosure_id')
      .eq('sensor_id', sensorId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Return array of enclosure IDs
    return data.map(mapping => mapping.enclosure_id);
  } catch (error: any) {
    console.error("Error getting sensor enclosures:", error.message);
    return null;
  }
};

/**
 * Remove a sensor mapping from an enclosure
 */
export const removeSensorMapping = async (enclosureId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    // Delete the mapping
    const { error } = await supabase
      .from('sensor_mappings')
      .delete()
      .eq('enclosure_id', enclosureId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    toast.success("Sensor disconnected from enclosure");
    return true;
  } catch (error: any) {
    console.error("Error removing sensor mapping:", error.message);
    toast.error(`Failed to disconnect sensor: ${error.message}`);
    return false;
  }
};
