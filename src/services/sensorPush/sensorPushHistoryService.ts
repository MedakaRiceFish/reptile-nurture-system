
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
    
    // TEMPORARY: For development/testing, generate mock data
    console.log("Using simulated history data for development");
    
    // Calculate the duration between start and end dates
    const duration = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(duration / (1000 * 60 * 60 * 24));
    
    // Determine the number of data points based on the interval
    let dataPoints: number;
    switch (interval) {
      case 'hour':
        dataPoints = days * 24; // 24 hours per day
        break;
      case 'day':
        dataPoints = days;
        break;
      case 'week':
        dataPoints = Math.ceil(days / 7);
        break;
      case 'month':
        dataPoints = Math.ceil(days / 30);
        break;
      default:
        dataPoints = days;
    }
    
    // Limit data points to prevent performance issues
    dataPoints = Math.min(dataPoints, 100);
    
    // Generate mock historical data
    const mockData = Array.from({ length: dataPoints }).map((_, index) => {
      // Create timestamps going from start to end date
      const timestamp = new Date(startDate);
      switch (interval) {
        case 'hour':
          timestamp.setHours(timestamp.getHours() + index);
          break;
        case 'day':
          timestamp.setDate(timestamp.getDate() + index);
          break;
        case 'week':
          timestamp.setDate(timestamp.getDate() + index * 7);
          break;
        case 'month':
          timestamp.setMonth(timestamp.getMonth() + index);
          break;
      }
      
      // Generate realistic values with some variation
      const baseTemp = 23 + Math.sin(index / 10) * 3; // ~73.4°F with sine wave variation
      const baseHumidity = 50 + Math.sin(index / 8) * 10; // 50% with sine wave variation
      
      return {
        time_bucket: timestamp.toISOString(),
        avg_temperature: parseFloat(baseTemp.toFixed(2)),
        avg_humidity: parseFloat(baseHumidity.toFixed(2)),
        avg_dewpoint: parseFloat((baseTemp - ((100 - baseHumidity) / 5)).toFixed(2)),
        min_temperature: parseFloat((baseTemp - 1 - Math.random()).toFixed(2)),
        max_temperature: parseFloat((baseTemp + 1 + Math.random()).toFixed(2)),
        min_humidity: parseFloat((baseHumidity - 5 - Math.random() * 2).toFixed(2)),
        max_humidity: parseFloat((baseHumidity + 5 + Math.random() * 2).toFixed(2)),
        sample_count: Math.floor(10 + Math.random() * 20)
      };
    });
    
    return mockData;
    
    /* 
    // COMMENTED OUT FOR NOW - USE THIS ONCE EDGE FUNCTION IS SET UP
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
    
    return data;
    */
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
export const getDataRetentionPolicy = async (): Promise<{ months: number } | null> => {
  try {
    // For development, just return mock data
    return { months: 18 };
    
    /* 
    // COMMENTED OUT FOR NOW - USE THIS ONCE EDGE FUNCTION IS SET UP
    const { data, error } = await supabase.rpc('get_data_retention_policy');
    
    if (error) {
      throw error;
    }
    
    // Fix: The database function returns an array with one object, so we need to return the first item
    return data && data.length > 0 ? data[0] : { months: 18 };
    */
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
    const retentionMonths = policy?.months || 18;
    
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
