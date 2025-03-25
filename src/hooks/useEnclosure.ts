
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { INITIAL_ENCLOSURE_DATA } from "@/utils/enclosureHelpers";

interface UseEnclosureProps {
  id?: string;
}

export const useEnclosure = (props?: UseEnclosureProps) => {
  const routeParams = useParams<{ id: string }>();
  const id = props?.id || routeParams.id;
  
  const [enclosure, setEnclosure] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && id.startsWith("sample-")) {
      const sampleEnclosure = INITIAL_ENCLOSURE_DATA.find(e => e.id === id);
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
      if (!id || id.startsWith("sample-")) return;
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('enclosures')
          .select('*')
          .eq('id', id)
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
  }, [id]);

  useEffect(() => {
    if (!id || (!enclosure && !isLoading)) {
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
  }, [id, enclosure, isLoading]);

  // Utility functions
  const getPlaceholderImage = () => {
    return "https://images.unsplash.com/photo-1585858229735-7be23558d95e?q=80&w=2070&auto=format&fit=crop";
  };

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getTemperatureColor = (temp: number) => {
    if (temp > 90) return "text-red-500";
    if (temp < 70) return "text-blue-500";
    return "text-reptile-500";
  };

  const getHumidityColor = (hum: number) => {
    if (hum > 80) return "text-blue-500";
    if (hum < 40) return "text-amber-500";
    return "text-reptile-500";
  };

  const getStatusColor = (status: string) => {
    if (status === "online") return "bg-green-500";
    if (status === "warning") return "bg-amber-500";
    return "bg-red-500";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (enclosure.id && enclosure.id !== "not-found" && !String(enclosure.id).startsWith("sample-")) {
      const { uploadImage } = await import("@/lib/supabase-storage");
      await uploadImage(file, `enclosures/${enclosure.id}`, async (url) => {
        try {
          const { error } = await supabase
            .from('enclosures')
            .update({ image_url: url })
            .eq('id', enclosure.id);
            
          if (error) throw error;
          
          setEnclosure({
            ...enclosure,
            image_url: url
          });
          
          toast.success("Enclosure image updated successfully!");
        } catch (error: any) {
          console.error('Error updating enclosure image URL:', error);
          toast.error(`Failed to update enclosure: ${error.message}`);
        }
      });
    } else {
      toast.error("Cannot upload image for this enclosure. Please save the enclosure first.");
      setImagePreview(null);
    }
  };

  const handleDetailsUpdate = async (data: any) => {
    if (enclosure.id && enclosure.id !== "not-found" && !String(enclosure.id).startsWith("sample-")) {
      try {
        const updateData = {
          type: data.type,
          size: data.size,
          substrate: data.substrate,
          plants: data.plants,
          updated_at: new Date().toISOString(),
        };
        
        const { error } = await supabase
          .from('enclosures')
          .update(updateData)
          .eq('id', enclosure.id);
          
        if (error) throw error;
        
        setEnclosure({
          ...enclosure,
          ...updateData
        });
        
        toast.success("Enclosure details updated successfully!");
      } catch (error: any) {
        console.error('Error updating enclosure details:', error);
        toast.error(`Failed to update enclosure: ${error.message}`);
      }
    } else {
      setEnclosure({
        ...enclosure,
        type: data.type,
        size: data.size,
        substrate: data.substrate,
        plants: data.plants,
      });
      
      toast.success("Enclosure details updated!");
    }
    
    setIsEditDialogOpen(false);
  };

  return {
    enclosure,
    isLoading,
    imagePreview,
    imageError,
    isEditDialogOpen,
    fileInputRef,
    setIsEditDialogOpen,
    getPlaceholderImage,
    handlePhotoButtonClick,
    handleImageError,
    getTemperatureColor,
    getHumidityColor,
    getStatusColor,
    handleFileChange,
    handleDetailsUpdate
  };
};
