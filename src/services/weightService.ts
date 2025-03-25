
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
    const formattedRecords = data.map(record => ({
      date: typeof record.recorded_at === 'string' 
        ? record.recorded_at.substring(0, 10) 
        : new Date(record.recorded_at).toISOString().substring(0, 10),
      weight: Number(record.weight)
    }));
    
    console.log('Formatted weight records:', formattedRecords);
    return formattedRecords || [];
  } catch (error: any) {
    toast.error(`Error fetching weight records: ${error.message}`);
    return [];
  }
};

export const addWeightRecord = async (record: WeightRecordInsert): Promise<WeightRecord | null> => {
  try {
    // Ensure the date is properly formatted
    const recordToInsert = {
      ...record,
      recorded_at: typeof record.recorded_at === 'string' 
        ? record.recorded_at 
        : new Date(record.recorded_at).toISOString(),
      weight: Number(record.weight)
    };
    
    console.log('Adding weight record:', recordToInsert);
    
    const { data, error } = await supabase
      .from('weight_records')
      .insert(recordToInsert)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Weight record added successfully:', data);
    toast.success('Weight record added successfully');
    return data;
  } catch (error: any) {
    console.error('Error adding weight record:', error);
    toast.error(`Error adding weight record: ${error.message}`);
    return null;
  }
};
