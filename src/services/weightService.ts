
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export interface WeightRecord {
  id?: string;
  animal_id: string;
  weight: number;
  recorded_at: string;
  owner_id: string;
}

export interface FormattedWeightRecord {
  id?: string;
  date: string;
  weight: number;
}

// Get all weight records for an animal
export const getAnimalWeightRecords = async (animalId: string): Promise<FormattedWeightRecord[]> => {
  try {
    console.log("Fetching weight records for animal ID:", animalId);
    
    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('animal_id', animalId)
      .order('recorded_at', { ascending: true });
    
    if (error) throw error;
    
    // Format the data
    const formattedRecords = data.map(record => ({
      id: record.id,
      date: format(new Date(record.recorded_at), 'yyyy-MM-dd'),
      weight: record.weight
    }));
    
    console.log("Fetched weight records:", formattedRecords);
    return formattedRecords;
  } catch (error: any) {
    console.error("Error fetching weight records:", error);
    toast.error(`Error fetching weight records: ${error.message}`);
    return [];
  }
};

// Add a weight record
export const addWeightRecord = async (record: WeightRecord): Promise<FormattedWeightRecord | null> => {
  try {
    console.log("Adding weight record:", record);
    
    const { data, error } = await supabase
      .from('weight_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    
    // Format the record
    const formattedRecord = {
      id: data.id,
      date: format(new Date(data.recorded_at), 'yyyy-MM-dd'),
      weight: data.weight
    };
    
    console.log("Successfully added weight record:", formattedRecord);
    return formattedRecord;
  } catch (error: any) {
    console.error("Error adding weight record:", error);
    toast.error(`Error adding weight record: ${error.message}`);
    return null;
  }
};

// Delete a weight record
export const deleteWeightRecord = async (id: string): Promise<boolean> => {
  try {
    console.log("Deleting weight record with ID:", id);
    
    const { error } = await supabase
      .from('weight_records')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }
    
    console.log("Weight record deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Error deleting weight record:", error);
    toast.error(`Error deleting weight record: ${error.message}`);
    return false;
  }
};

// Get the latest weight record for an animal
export const getLatestWeightRecord = async (animalId: string): Promise<FormattedWeightRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('animal_id', animalId)
      .order('recorded_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Format the record
      const formattedRecord = {
        id: data[0].id,
        date: format(new Date(data[0].recorded_at), 'yyyy-MM-dd'),
        weight: data[0].weight
      };
      
      return formattedRecord;
    }
    
    return null;
  } catch (error: any) {
    console.error("Error fetching latest weight record:", error);
    return null;
  }
};

// Update animal's current weight
export const updateAnimalWeight = async (animalId: string, weight: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('animals')
      .update({ weight })
      .eq('id', animalId);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error("Error updating animal weight:", error);
    return false;
  }
};
