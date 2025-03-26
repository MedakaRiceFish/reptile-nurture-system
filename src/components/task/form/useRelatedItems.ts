
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RelatedItem {
  id: string;
  name: string;
}

export const useRelatedItems = (
  relatedType: 'enclosure' | 'animal' | 'hardware' | null | undefined
) => {
  const [items, setItems] = useState<RelatedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchItems = useCallback(async () => {
    if (!relatedType) {
      setItems([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      let data: RelatedItem[] = [];
      
      if (relatedType === 'enclosure') {
        const { data: enclosures, error } = await supabase
          .from('enclosures')
          .select('id, name:label');
          
        if (error) throw error;
        data = enclosures || [];
      } 
      else if (relatedType === 'animal') {
        const { data: animals, error } = await supabase
          .from('animals')
          .select('id, name');
          
        if (error) throw error;
        data = animals || [];
      } 
      else if (relatedType === 'hardware') {
        const { data: devices, error } = await supabase
          .from('hardware_devices')
          .select('id, name:device_name');
          
        if (error) throw error;
        data = devices || [];
      }
      
      setItems(data);
    } catch (error) {
      console.error('Error fetching related items:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [relatedType]);
  
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  
  return { items, isLoading };
};
