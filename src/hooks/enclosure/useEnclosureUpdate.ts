
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EnclosureState } from "./useEnclosureData";

export const useEnclosureUpdate = (
  enclosure: EnclosureState | null,
  setEnclosure: React.Dispatch<React.SetStateAction<EnclosureState | null>>
) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDetailsUpdate = async (data: any) => {
    if (!enclosure) return;
    
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
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleDetailsUpdate
  };
};
