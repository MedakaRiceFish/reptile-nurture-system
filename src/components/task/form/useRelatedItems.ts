
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RelatedItem {
  id: string;
  name: string;
}

export function useRelatedItems(open: boolean) {
  const [enclosures, setEnclosures] = useState<RelatedItem[]>([]);
  const [animals, setAnimals] = useState<RelatedItem[]>([]);
  const [hardware, setHardware] = useState<RelatedItem[]>([]);
  
  useEffect(() => {
    if (!open) return;
    
    const fetchRelatedItems = async () => {
      try {
        // Fetch enclosures
        const { data: enclosureData } = await supabase
          .from('enclosures')
          .select('id, name');
        
        // Fetch animals
        const { data: animalData } = await supabase
          .from('animals')
          .select('id, name');
        
        // Fetch hardware devices
        const { data: hardwareData } = await supabase
          .from('hardware_devices')
          .select('id, name');
        
        if (enclosureData) setEnclosures(enclosureData);
        if (animalData) setAnimals(animalData);
        if (hardwareData) setHardware(hardwareData);
      } catch (error) {
        console.error('Error fetching related items:', error);
      }
    };
    
    fetchRelatedItems();
  }, [open]);

  return {
    enclosures,
    animals,
    hardware
  };
}
