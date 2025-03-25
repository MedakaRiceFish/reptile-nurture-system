
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { 
  addWeightRecord, 
  deleteWeightRecord,
  updateAnimalWeight
} from "@/services/weightService";
import { WeightRecord, AnimalWithWeightHistory } from "./types";

export const useAnimalWeight = (
  animalId: string | undefined,
  userId: string | undefined,
  setAnimalData: React.Dispatch<React.SetStateAction<any>>,
  weightRecords: WeightRecord[],
  setWeightRecords: React.Dispatch<React.SetStateAction<WeightRecord[]>>,
  deletedRecordIds: Set<string>,
  setDeletedRecordIds: React.Dispatch<React.SetStateAction<Set<string>>>,
  refetchWeightRecords: () => Promise<WeightRecord[] | null>
) => {
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddWeight = async (data: any) => {
    if (!data.weight || isNaN(parseFloat(data.weight)) || !userId || !animalId) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value",
        variant: "destructive"
      });
      return;
    }

    try {
      const weightValue = parseFloat(data.weight);
      const recordDate = format(data.date, "yyyy-MM-dd");
      
      console.log("Adding new weight record:", {
        animalId,
        weight: weightValue,
        date: recordDate
      });
      
      const newRecord = {
        animal_id: animalId,
        weight: weightValue,
        recorded_at: recordDate,
        owner_id: userId
      };
      
      const result = await addWeightRecord(newRecord);
      
      if (result) {
        console.log("Added new weight record:", result);
        
        // Immediately update the weightRecords state with the new record
        setWeightRecords(prevRecords => {
          // Create a new array with the new record
          const updatedRecords = [...prevRecords, result];
          console.log("Updated weight records after addition:", updatedRecords);
          return updatedRecords;
        });
        
        // Then refetch to ensure we have the latest data
        const updatedRecords = await refetchWeightRecords();
        if (!updatedRecords) {
          console.log("Failed to refetch weight records after adding, using optimistic update");
        }
        
        // Update the animal's weight if this is the newest record
        const isNewestRecord = !weightRecords.some(record => 
          new Date(record.date) > new Date(result.date)
        );
        
        if (isNewestRecord) {
          setAnimalData(prevData => ({
            ...prevData,
            weight: weightValue
          }));
          
          await updateAnimalWeight(animalId, weightValue);
        }
        
        toast({
          title: "Weight record added",
          description: `New weight of ${weightValue}g recorded`,
        });
        
        setIsWeightDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error adding weight record:", error);
      toast({
        title: "Error",
        description: "Failed to add weight record",
        variant: "destructive"
      });
    }
  };

  const handleDeleteWeight = async (id: string) => {
    if (!animalId || !id) return;
    
    try {
      console.log("Deleting weight record with ID:", id);
      
      // Add to deletedRecordIds immediately for optimistic UI update
      setDeletedRecordIds(prev => {
        // Create a new Set with all previous values plus the new one
        const newSet = new Set(prev);
        newSet.add(id);
        console.log(`Added ID ${id} to deletedRecordIds. New set:`, Array.from(newSet));
        return newSet;
      });
      
      // Update UI by filtering out the deleted record
      setWeightRecords(prevRecords => {
        return prevRecords.filter(record => record.id !== id);
      });
      
      // Now do the actual API call
      const success = await deleteWeightRecord(id);
      
      if (success) {
        console.log("Successfully deleted weight record ID:", id);
        console.log("Updated deletedRecordIds after deletion:", Array.from(deletedRecordIds));
        
        // Notify user of success
        toast({
          title: "Weight record deleted",
          description: "The weight record has been successfully deleted"
        });
      } else {
        console.error("Failed to delete weight record ID:", id);
        
        // Remove from deletedRecordIds if API call failed
        setDeletedRecordIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        
        // Rollback UI changes
        refetchWeightRecords();
        
        toast({
          title: "Error",
          description: "Failed to delete weight record",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error deleting weight record:", error);
      
      // Remove from deletedRecordIds if an error occurred
      setDeletedRecordIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      // Rollback optimistic UI update
      refetchWeightRecords();
      
      toast({
        title: "Error",
        description: "Failed to delete weight record",
        variant: "destructive"
      });
    }
  };

  return {
    weightRecords,
    setWeightRecords,
    isWeightDialogOpen,
    setIsWeightDialogOpen,
    handleAddWeight,
    handleDeleteWeight
  };
};
