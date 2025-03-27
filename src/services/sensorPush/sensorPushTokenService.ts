
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "./sensorPushBaseService";

/**
 * Store an API token in the database
 */
export const storeApiToken = async (
  service: 'sensorpush_auth' | 'sensorpush_access' | 'sensorpush_refresh',
  token: string,
  expiresAt: Date
): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    await supabase.rpc('upsert_api_token', {
      p_user_id: userId,
      p_service: service,
      p_token: token,
      p_expires_at: expiresAt.toISOString()
    });
    
    console.log(`Successfully stored ${service} token`);
  } catch (storageError) {
    console.error(`Error storing ${service} token:`, storageError);
    throw new Error(`Failed to store SensorPush ${service} token`);
  }
};

/**
 * Get a specific SensorPush token by type
 * Returns null if the token doesn't exist or is expired
 */
export const getApiToken = async (
  service: 'sensorpush_auth' | 'sensorpush_access' | 'sensorpush_refresh'
): Promise<{ token: string; expires_at: string } | null> => {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('api_tokens')
      .select('token, expires_at')
      .eq('user_id', userId)
      .eq('service', service)
      .maybeSingle();
      
    if (error || !data) {
      console.log(`No SensorPush ${service} token found`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to get SensorPush ${service} token:`, error);
    return null;
  }
};
