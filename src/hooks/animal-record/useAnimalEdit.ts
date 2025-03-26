
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateAnimal } from "@/services/animalService";
import { supabase } from "@/integrations/supabase/client";
import { addDays, addHours, addMonths, addWeeks } from "date-fns";

export const useAnimalEdit = (
  setAnimalData: React.Dispatch<React.SetStateAction<any>>
) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const calculateNextFeedingDate = (schedule: string, lastFedDate: Date | null) => {
    try {
      if (!schedule) return null;
      
      const [intervalStr, frequency] = schedule.split(':');
      const interval = parseInt(intervalStr, 10);
      
      if (isNaN(interval) || interval <= 0) return null;
      
      const baseDate = lastFedDate || new Date();
      
      switch (frequency) {
        case 'hours':
          return addHours(baseDate, interval);
        case 'days':
          return addDays(baseDate, interval);
        case 'weeks':
          return addWeeks(baseDate, interval);
        case 'months':
          return addMonths(baseDate, interval);
        default:
          return null;
      }
    } catch (error) {
      console.error("Error calculating next feeding date:", error);
      return null;
    }
  };

  const handleEditSubmit = async (data: any, animalId: string) => {
    if (!animalId) return;
    
    try {
      // Calculate the next feeding date based on the specified schedule
      const nextFeedingDate = data.feedingSchedule ? 
        calculateNextFeedingDate(data.feedingSchedule, null) : null;
      
      const updatedAnimal = {
        name: data.name,
        species: data.species,
        age: parseInt(data.age),
        length: parseInt(data.length),
        feeding_schedule: data.feedingSchedule,
        next_feeding_date: nextFeedingDate?.toISOString(),
        breeding_source: data.breederSource,
        custom_id: data.customId,
        description: data.description,
        enclosure_id: data.enclosure_id === "none" ? null : data.enclosure_id
      };
      
      const result = await updateAnimal(animalId, updatedAnimal);
      
      if (result) {
        let enclosureName = "";
        
        if (data.enclosure_id && data.enclosure_id !== "none") {
          try {
            const { data: enclosureData } = await supabase
              .from('enclosures')
              .select('name')
              .eq('id', data.enclosure_id)
              .maybeSingle();
              
            if (enclosureData) {
              enclosureName = enclosureData.name;
            }
          } catch (error) {
            console.error("Error fetching enclosure name:", error);
          }
        }
        
        setAnimalData({
          ...result,
          enclosureName: enclosureName
        });
        
        setIsEditDialogOpen(false);
        
        toast({
          title: "Animal details updated",
          description: `${data.name}'s details have been updated successfully`,
        });
      }
    } catch (error: any) {
      console.error("Error updating animal:", error);
      toast({
        title: "Error",
        description: "Failed to update animal details",
        variant: "destructive"
      });
    }
  };

  return {
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleEditSubmit
  };
};
