
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type WeightRecord = {
  id: string;
  animal_id: string;
  weight: number;
  recorded_at: string;
  owner_id: string;
};

export type WeightRecordInsert = Omit<WeightRecord, 'id'>;

export const getAnimalWeightRecords = async (animalId: string): Promise<{date: string, weight: number}[]> => {
  try {
    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('animal_id', animalId)
      .order('recorded_at', { ascending: true });
    
    if (error) throw error;
    
    console.log('Raw weight records from DB:', data);
    
    // Format the records to match the expected format for the components
    return data.map(record => ({
      date: record.recorded_at.substring(0, 10), // Ensure we only get YYYY-MM-DD
      weight: record.weight
    })) || [];
  } catch (error: any) {
    toast.error(`Error fetching weight records: ${error.message}`);
    return [];
  }
};

export const addWeightRecord = async (record: WeightRecordInsert): Promise<WeightRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('weight_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    toast.success('Weight record added successfully');
    return data;
  } catch (error: any) {
    toast.error(`Error adding weight record: ${error.message}`);
    return null;
  }
};
