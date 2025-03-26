
import { supabase } from "@/integrations/supabase/client";
import { SensorPushSample, SensorPushSensor } from "@/types/sensorpush";
import { getCurrentUserId } from "./sensorPushBaseService";
import { ensureSensorsHistoryTableExists, ensureSamplesHistoryTableExists } from "./sensorPushDatabaseService";

/**
 * Store sensors data in the database for historical tracking
 * This enables us to maintain 18+ months of history for analytics
 */
export const storeSensorsData = async (sensors: Record<string, SensorPushSensor> | SensorPushSensor[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // Ensure the sensors_history table exists
    await ensureSensorsHistoryTableExists();
    
    // Store each sensor in the database with a timestamp
    const timestamp = new Date().toISOString();
    
    // Handle both array and record formats
    const sensorEntries = Array.isArray(sensors) 
      ? sensors.map(sensor => [sensor.id, sensor] as [string, SensorPushSensor])
      : Object.entries(sensors);
    
    for (const [sensorId, sensorData] of sensorEntries) {
      // Always stringify the sensor data before passing to the RPC function
      const sensorDataJson = JSON.stringify(sensorData);
        
      await supabase.rpc('store_sensor_data', {
        p_sensor_id: sensorId,
        p_sensor_data: sensorDataJson,
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
 * Store sensor samples in the database for long-term analytics
 * This ensures we maintain 18+ months of historical data
 */
export const storeSamplesData = async (sensorId: string, samples: SensorPushSample[]): Promise<void> => {
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
