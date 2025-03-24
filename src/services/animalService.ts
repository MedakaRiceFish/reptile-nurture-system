
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Animal = {
  id: string;
  name: string;
  species: string;
  age: number;
  weight: number;
  length: number | null;
  enclosure_id: string | null;
  feeding_schedule: string | null;
  breeding_source: string | null;
  description: string | null;
  image_url: string | null;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
};

export type AnimalInsert = Omit<Animal, 'id' | 'created_at' | 'updated_at'>;
export type AnimalUpdate = Partial<Omit<Animal, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>;

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
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
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
