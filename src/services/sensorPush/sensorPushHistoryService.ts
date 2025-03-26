
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SensorPushSample } from "@/types/sensorpush";
import { getCurrentUserId } from "./sensorPushBaseService";

/**
 * Fetch historical sensor data for analytics
 * Allows fetching up to 18+ months of data for trend analysis
 */
export const fetchSensorHistory = async (
  sensorId: string,
  startDate: Date,
  endDate: Date = new Date(),
  interval: 'hour' | 'day' | 'week' | 'month' = 'day'
): Promise<any[] | null> => {
  try {
    const userId = await getCurrentUserId();
    
    // Use database function to get aggregated history with proper time intervals
    const { data, error } = await supabase.rpc('get_sensor_history', {
      p_sensor_id: sensorId,
      p_user_id: userId,
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
      p_interval: interval
    });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error("Error fetching sensor history:", error.message);
    toast.error(`Failed to fetch sensor history: ${error.message}`);
    return null;
  }
};

/**
 * Get data retention policy for sensor data
 * By default we store data for 18+ months
 */
export const getDataRetentionPolicy = async (): Promise<{ months: number }> => {
  try {
    const { data, error } = await supabase.rpc('get_data_retention_policy');
    
    if (error) {
      throw error;
    }
    
    // The database function returns an array with one object, 
    // or it might return a single object depending on RPC implementation
    if (Array.isArray(data) && data.length > 0) {
      return data[0]; 
    } else if (data && 'months' in data) {
      return data as { months: number };
    }
    
    // Default fallback
    return { months: 18 };
  } catch (error: any) {
    console.error("Error fetching data retention policy:", error.message);
    return { months: 18 }; // Default to 18 months if we can't fetch the policy
  }
};

/**
 * Purge old sensor data based on retention policy
 * This is useful for cleanup operations
 */
export const purgeOldSensorData = async (): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    const policy = await getDataRetentionPolicy();
    const retentionMonths = policy.months;
    
    // Calculate the cutoff date based on retention policy
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);
    
    // Use database function to purge old data
    const { error } = await supabase.rpc('purge_old_sensor_data', {
      p_user_id: userId,
      p_cutoff_date: cutoffDate.toISOString()
    });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error purging old sensor data:", error.message);
    return false;
  }
};

/**
 * Export sensor data for a given time period
 * Useful for users who want to analyze their data externally
 */
export const exportSensorData = async (
  sensorId: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<SensorPushSample[] | null> => {
  try {
    const userId = await getCurrentUserId();
    
    // Get raw samples for export
    const { data, error } = await supabase
      .from('samples_history')
      .select('*')
      .eq('sensor_id', sensorId)
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data as unknown as SensorPushSample[];
  } catch (error: any) {
    console.error("Error exporting sensor data:", error.message);
    toast.error(`Failed to export sensor data: ${error.message}`);
    return null;
  }
};
