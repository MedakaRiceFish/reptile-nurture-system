
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, addHours, addMonths, addWeeks } from "date-fns";

export type Animal = {
  id: string;
  name: string;
  species: string;
  age: number;
  weight: number;
  length: number | null;
  enclosure_id: string | null;
  feeding_schedule: string | null;
  next_feeding_date: string | null;
  breeding_source: string | null;
  description: string | null;
  image_url: string | null;
  owner_id: string;
  last_fed_date: string | null;
  custom_id: string | null;
  created_at?: string;
  updated_at?: string;
  enclosureName?: string;
  enclosure?: string;
  enclosure_name?: string;
};

export type AnimalInsert = Omit<Animal, 'id' | 'created_at' | 'updated_at' | 'enclosureName' | 'enclosure' | 'enclosure_name'>;
export type AnimalUpdate = Partial<Omit<Animal, 'id' | 'owner_id' | 'created_at' | 'updated_at' | 'enclosureName' | 'enclosure' | 'enclosure_name'>>;

export const getAnimals = async (): Promise<Animal[]> => {
  try {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast.error(`Error fetching animals: ${error.message}`);
    return [];
  }
};

export const getAnimal = async (id: string): Promise<Animal | null> => {
  try {
    // First get the animal data
    const { data: animalData, error: animalError } = await supabase
      .from('animals')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (animalError) throw animalError;
    
    // If animal has enclosure_id, get the enclosure name
    if (animalData && animalData.enclosure_id) {
      const { data: enclosureData, error: enclosureError } = await supabase
        .from('enclosures')
        .select('name')
        .eq('id', animalData.enclosure_id)
        .maybeSingle();
      
      if (!enclosureError && enclosureData) {
        return {
          ...animalData,
          enclosureName: enclosureData.name,
          enclosure: animalData.enclosure_id // Add this alias for compatibility
        };
      }
    }
    
    return animalData;
  } catch (error: any) {
    toast.error(`Error fetching animal: ${error.message}`);
    return null;
  }
};

export const createAnimal = async (animal: AnimalInsert): Promise<Animal | null> => {
  try {
    const { data, error } = await supabase
      .from('animals')
      .insert(animal)
      .select()
      .single();
    
    if (error) throw error;
    toast.success(`${animal.name} added successfully!`);
    return data;
  } catch (error: any) {
    toast.error(`Error creating animal: ${error.message}`);
    return null;
  }
};

export const updateAnimal = async (id: string, updates: AnimalUpdate): Promise<Animal | null> => {
  try {
    const { data, error } = await supabase
      .from('animals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    toast.success(`Animal updated successfully!`);
    return data;
  } catch (error: any) {
    toast.error(`Error updating animal: ${error.message}`);
    return null;
  }
};

export const deleteAnimal = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    toast.success(`Animal deleted successfully!`);
    return true;
  } catch (error: any) {
    toast.error(`Error deleting animal: ${error.message}`);
    return false;
  }
};

export const updateLastFedDate = async (id: string): Promise<Animal | null> => {
  try {
    // First get the current animal data to access the feeding schedule
    const { data: animalData, error: fetchError } = await supabase
      .from('animals')
      .select('feeding_schedule')
      .eq('id', id)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    
    // Calculate next feeding date based on the feeding schedule
    const now = new Date();
    let nextFeedingDate = null;
    
    if (animalData?.feeding_schedule) {
      const [intervalStr, frequency] = animalData.feeding_schedule.split(':');
      const interval = parseInt(intervalStr, 10);
      
      if (!isNaN(interval) && interval > 0) {
        switch (frequency) {
          case 'hours':
            nextFeedingDate = addHours(now, interval);
            break;
          case 'days':
            nextFeedingDate = addDays(now, interval);
            break;
          case 'weeks':
            nextFeedingDate = addWeeks(now, interval);
            break;
          case 'months':
            nextFeedingDate = addMonths(now, interval);
            break;
        }
      }
    }
    
    // Update the animal with the new last_fed_date and next_feeding_date
    const updates = {
      last_fed_date: now.toISOString(),
      next_feeding_date: nextFeedingDate ? nextFeedingDate.toISOString() : null
    };
    
    const { data, error } = await supabase
      .from('animals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success(`Feeding recorded successfully!`);
    return data;
  } catch (error: any) {
    toast.error(`Error updating feeding date: ${error.message}`);
    return null;
  }
};
