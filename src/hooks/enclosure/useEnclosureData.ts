
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { INITIAL_ENCLOSURE_DATA } from "@/utils/enclosureHelpers";

export interface EnclosureState {
  id: string;
  name: string;
  type: string;
  size: string;
  substrate: string;
  plants: string[];
  temperature: number;
  humidity: number;
  light_cycle: string;
  ventilation: string;
  image_url: string;
  last_reading: string;
  reading_status: string;
}

export const useEnclosureData = (id?: string) => {
  const routeParams = useParams<{ id: string }>();
  const enclosureId = id || routeParams.id;
  
  const [enclosure, setEnclosure] = useState<EnclosureState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (enclosureId && enclosureId.startsWith("sample-")) {
      const sampleEnclosure = INITIAL_ENCLOSURE_DATA.find(e => e.id === enclosureId);
      if (sampleEnclosure) {
        setEnclosure({
          id: sampleEnclosure.id,
          name: sampleEnclosure.name,
          type: "Desert",
          size: "24\" x 18\" x 18\"",
          substrate: "Sand and clay mix",
          plants: ["Aloe vera", "Haworthia"],
          temperature: sampleEnclosure.temperature,
          humidity: sampleEnclosure.humidity,
          light_cycle: "12/12",
          ventilation: "Medium",
          image_url: sampleEnclosure.image,
          last_reading: new Date().toISOString(),
          reading_status: sampleEnclosure.readingStatus.toLowerCase(),
        });
        setIsLoading(false);
        return;
      }
    }

    const fetchEnclosure = async () => {
      if (!enclosureId || enclosureId.startsWith("sample-")) return;
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('enclosures')
          .select('*')
          .eq('id', enclosureId)
          .single();
          
        if (error) throw error;
        
        setEnclosure(data);
      } catch (error: any) {
        console.error('Error fetching enclosure:', error);
        toast.error(`Failed to load enclosure: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnclosure();
  }, [enclosureId]);

  useEffect(() => {
    if (!enclosureId || (!enclosure && !isLoading)) {
      setEnclosure({
        id: "not-found",
        name: "Desert Terrarium",
        type: "Desert",
        size: "24\" x 18\" x 18\"",
        substrate: "Sand and clay mix",
        plants: ["Aloe vera", "Haworthia"],
        temperature: 85,
        humidity: 40,
        light_cycle: "12/12",
        ventilation: "Medium",
        image_url: "https://images.unsplash.com/photo-1585858229735-7be23558d95e?q=80&w=2070&auto=format&fit=crop",
        last_reading: new Date().toISOString(),
        reading_status: "online",
      });
    }
  }, [enclosureId, enclosure, isLoading]);

  return {
    enclosure,
    setEnclosure,
    isLoading
  };
};
