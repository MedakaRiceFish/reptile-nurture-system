
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
    console.log("Fetching weight records for animal ID:", animalId);
    
    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('animal_id', animalId)
      .order('recorded_at', { ascending: true });
    
    if (error) throw error;
    
    console.log('Raw weight records from DB:', data);
    
    // Format the records to match the expected format for the components
    const formattedRecords = data.map(record => {
      // Handle timestamp format - ensure we get just the date part
      let dateString;
      if (typeof record.recorded_at === 'string') {
        // If it's already a string, extract just the date part (YYYY-MM-DD)
        dateString = record.recorded_at.substring(0, 10);
      } else {
        // If it's a Date object, convert to ISO string and get date part
        dateString = new Date(record.recorded_at).toISOString().substring(0, 10);
      }
      
      return {
        date: dateString,
        weight: Number(record.weight)
      };
    });
    
    console.log('Formatted weight records:', formattedRecords);
    return formattedRecords || [];
  } catch (error: any) {
    console.error("Error fetching weight records:", error);
    toast.error(`Error fetching weight records: ${error.message}`);
    return [];
  }
};

export const addWeightRecord = async (record: WeightRecordInsert): Promise<WeightRecord | null> => {
  try {
    // Ensure the date is properly formatted as ISO string
    let formattedDate;
    if (typeof record.recorded_at === 'string') {
      // If it's a date string in ISO format (YYYY-MM-DD), we keep it
      if (record.recorded_at.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedDate = record.recorded_at;
      } else {
        // Otherwise, parse it and convert to ISO
        formattedDate = new Date(record.recorded_at).toISOString().substring(0, 10);
      }
    } else {
      // If it's a Date object, convert to ISO string
      formattedDate = new Date(record.recorded_at).toISOString().substring(0, 10);
    }
    
    const recordToInsert = {
      ...record,
      recorded_at: formattedDate,
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

// Add this new function to get the latest weight record for an animal
export const getLatestWeightRecord = async (animalId: string): Promise<{date: string, weight: number} | null> => {
  try {
    console.log("Fetching latest weight record for animal ID:", animalId);
    
    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('animal_id', animalId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No records found
        console.log('No weight records found for animal:', animalId);
        return null;
      }
      throw error;
    }
    
    if (!data) return null;
    
    // Format the date
    let dateString;
    if (typeof data.recorded_at === 'string') {
      dateString = data.recorded_at.substring(0, 10);
    } else {
      dateString = new Date(data.recorded_at).toISOString().substring(0, 10);
    }
    
    const formattedRecord = {
      date: dateString,
      weight: Number(data.weight)
    };
    
    console.log('Latest weight record:', formattedRecord);
    return formattedRecord;
  } catch (error: any) {
    console.error("Error fetching latest weight record:", error);
    return null;
  }
};
