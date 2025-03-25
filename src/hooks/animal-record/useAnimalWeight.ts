
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
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
  setDeletedRecordIds: React.Dispatch<React.SetStateAction<Set<string>>>
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
        
        // Add the new record to the state instead of refetching all records
        // This prevents deleted records from reappearing
        setWeightRecords(prevRecords => {
          const newRecords = [...prevRecords, result];
          // Sort records by date (newest first)
          return newRecords.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        });
        
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
      const success = await deleteWeightRecord(id);
      
      if (success) {
        // Add the deleted record ID to our tracking set
        setDeletedRecordIds(prev => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
        });
        
        // Log the updated set of deleted IDs for debugging
        console.log("Updated deletedRecordIds after deletion:", 
          Array.from(new Set([...Array.from(deletedRecordIds), id])));
        
        // Update the weight records list
        setWeightRecords(prevRecords => {
          const updatedRecords = prevRecords.filter(record => record.id !== id);
          console.log("Updated weight records after deletion:", updatedRecords);
          return updatedRecords;
        });
        
        // Update the animal's current weight if needed
        const remainingRecords = weightRecords.filter(record => record.id !== id);
        
        let newWeight = 0;
        if (remainingRecords.length > 0) {
          // Sort to get the latest record
          const sortedRecords = [...remainingRecords].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          newWeight = sortedRecords[0].weight;
          
          // Update the animal's weight in the database
          await updateAnimalWeight(animalId, newWeight);
        }
        
        // Update the animal's weight in the state
        setAnimalData(prev => ({
          ...prev,
          weight: newWeight
        }));
        
        toast({
          title: "Weight record deleted",
          description: "The weight record has been successfully deleted"
        });
      }
    } catch (error: any) {
      console.error("Error deleting weight record:", error);
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
