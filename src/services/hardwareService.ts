
import { supabase } from "@/integrations/supabase/client";
import { HardwareItem } from "@/types/hardware";
import { toast } from "sonner";

// Fetch all hardware devices for an enclosure
export const fetchHardwareDevices = async (enclosureId: string) => {
  try {
    const { data, error } = await supabase
      .from('hardware_devices')
      .select('*')
      .eq('enclosure_id', enclosureId)
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      lastMaintenance: new Date(item.last_maintenance),
      nextMaintenance: new Date(item.next_maintenance),
      enclosureId: item.enclosure_id
    }));
  } catch (error: any) {
    console.error('Error fetching hardware devices:', error);
    toast.error(`Failed to load hardware devices: ${error.message}`);
    return [];
  }
};

// Add a new hardware device
export const addHardwareDevice = async (device: Omit<HardwareItem, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('hardware_devices')
      .insert({
        enclosure_id: device.enclosureId,
        name: device.name,
        type: device.type,
        last_maintenance: device.lastMaintenance.toISOString(),
        next_maintenance: device.nextMaintenance.toISOString(),
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      lastMaintenance: new Date(data.last_maintenance),
      nextMaintenance: new Date(data.next_maintenance),
      enclosureId: data.enclosure_id
    };
  } catch (error: any) {
    console.error('Error adding hardware device:', error);
    throw error;
  }
};

// Update a hardware device's maintenance dates
export const updateDeviceMaintenance = async (
  id: string, 
  lastMaintenance: Date, 
  nextMaintenance: Date
) => {
  try {
    const { error } = await supabase
      .from('hardware_devices')
      .update({
        last_maintenance: lastMaintenance.toISOString(),
        next_maintenance: nextMaintenance.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error updating device maintenance:', error);
    throw error;
  }
};
