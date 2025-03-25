
import { useState, useCallback } from "react";
import { getAnimalWeightRecords, addWeightRecord } from "@/services/weightService";
import { format } from "date-fns";
import { WeightRecord, AnimalWithWeightHistory } from "./types";
import { useDeletedRecords } from "./useDeletedRecords";

export const useWeightRecordsFetcher = (
  animalId: string | undefined,
  userId: string | undefined,
  deletedRecordIds: Set<string>
) => {
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const { filterDeletedRecords } = useDeletedRecords(deletedRecordIds);

  // Function to refetch just weight records
  const refetchWeightRecords = useCallback(async () => {
    if (!animalId || !userId) return null;
    
    try {
      console.log("Refetching weight records for animal ID:", animalId);
      
      const weightRecordsResult = await getAnimalWeightRecords(animalId);
      
      console.log("Refetched weight records:", weightRecordsResult);
      console.log("Current deletedRecordIds for filtering:", Array.from(deletedRecordIds));
      
      // Filter out deleted records
      const filteredRecords = filterDeletedRecords(weightRecordsResult);
      console.log("Refetched and filtered weight records:", filteredRecords);
      
      setWeightRecords(filteredRecords);
      
      return filteredRecords;
    } catch (error) {
      console.error("Error refetching weight records:", error);
      return null;
    }
  }, [animalId, userId, filterDeletedRecords, deletedRecordIds]);

  // Create initial weight record if needed
  const createInitialWeightRecord = useCallback(async (
    animalResult: AnimalWithWeightHistory,
    filteredRecords: WeightRecord[]
  ) => {
    if (!userId || !animalId) return;
    
    if (filteredRecords.length === 0 && animalResult.weight) {
      const today = format(new Date(), "yyyy-MM-dd");
      
      try {
        const newRecord = {
          animal_id: animalResult.id,
          weight: animalResult.weight,
          recorded_at: today,
          owner_id: userId
        };
        
        // Create record asynchronously without blocking UI
        const result = await addWeightRecord(newRecord);
        if (result) {
          setWeightRecords([result]);
          console.log("Created initial weight record:", result);
          return result;
        }
      } catch (error) {
        console.error("Error creating initial weight record:", error);
      }
    }
    
    return null;
  }, [animalId, userId]);

  // Fetch weight records for an animal
  const fetchWeightRecords = useCallback(async () => {
    if (!animalId) return [];
    
    try {
      console.log("Fetching weight records for animal ID:", animalId);
      
      const weightRecordsResult = await getAnimalWeightRecords(animalId);
      
      console.log("Fetched weight records:", weightRecordsResult);
      console.log("Current deletedRecordIds for filtering:", Array.from(deletedRecordIds));
      
      // Filter out deleted records
      const filteredRecords = filterDeletedRecords(weightRecordsResult);
      
      console.log("Filtered weight records:", filteredRecords);
      
      setWeightRecords(filteredRecords);
      return filteredRecords;
    } catch (error) {
      console.error("Error fetching weight records:", error);
      return [];
    }
  }, [animalId, deletedRecordIds, filterDeletedRecords]);

  return {
    weightRecords,
    setWeightRecords,
    fetchWeightRecords,
    refetchWeightRecords,
    createInitialWeightRecord
  };
};
