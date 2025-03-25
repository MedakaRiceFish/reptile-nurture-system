
import { useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  addWeightRecord, 
  updateAnimalWeight
} from "@/services/weightService";
import { WeightRecord } from "./types";

export const useWeightRecordManager = (
  animalId: string | undefined,
  userId: string | undefined,
  setAnimalData: React.Dispatch<React.SetStateAction<any>>,
  setWeightRecords: React.Dispatch<React.SetStateAction<WeightRecord[]>>,
  refetchWeightRecords: () => Promise<WeightRecord[] | null>
) => {
  // Add weight record functionality
  const handleAddWeight = useCallback(async (data: any) => {
    if (!data.weight || isNaN(parseFloat(data.weight)) || !userId || !animalId) {
      toast.error("Please enter a valid weight value");
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
        const isNewestRecord = (weightRecords: WeightRecord[]) => !weightRecords.some(record => 
          new Date(record.date) > new Date(result.date)
        );
        
        setWeightRecords(currentRecords => {
          if (isNewestRecord(currentRecords)) {
            setAnimalData(prevData => ({
              ...prevData,
              weight: weightValue
            }));
            
            updateAnimalWeight(animalId, weightValue);
          }
          return currentRecords;
        });
        
        toast.success(`New weight of ${weightValue}g recorded`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Error adding weight record:", error);
      toast.error("Failed to add weight record");
      return false;
    }
  }, [animalId, userId, setAnimalData, setWeightRecords, refetchWeightRecords]);

  return { handleAddWeight };
};
