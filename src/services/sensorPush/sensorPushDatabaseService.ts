
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensure the sensors_history table exists for long-term data storage
 */
export const ensureSensorsHistoryTableExists = async (): Promise<void> => {
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
 * Ensure the samples_history table exists for long-term data storage
 */
export const ensureSamplesHistoryTableExists = async (): Promise<void> => {
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
