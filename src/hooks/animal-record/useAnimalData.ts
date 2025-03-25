
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { WeightRecord } from "./types";
import { useDeletedRecords } from "./useDeletedRecords";
import { useWeightRecordsFetcher } from "./useWeightRecordsFetcher";
import { useAnimalDataManager } from "./useAnimalDataManager";

export const useAnimalData = (
  animalId: string | undefined,
  userId: string | undefined,
  deletedRecordIds: Set<string>
) => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const initialDataFetchedRef = useRef(false);
  const isMountedRef = useRef(true);
  const prevDeletedIdsRef = useRef<string[]>([]);

  // Import the modularized hooks
  const { filterDeletedRecords, haveDeletedIdsChanged } = useDeletedRecords(deletedRecordIds);
  
  const {
    animalData,
    setAnimalData,
    fetchAnimalData,
    updateAnimalWithCurrentWeight
  } = useAnimalDataManager();
  
  const {
    weightRecords,
    setWeightRecords,
    fetchWeightRecords,
    refetchWeightRecords,
    createInitialWeightRecord
  } = useWeightRecordsFetcher(animalId, userId, deletedRecordIds);

  // Memoize the data fetching function with useCallback
  const fetchData = useCallback(async () => {
    if (!animalId || !userId || !isMountedRef.current) {
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching animal data for ID:", animalId);
      console.log("Current deletedRecordIds:", Array.from(deletedRecordIds));
      
      // Use Promise.all to fetch animal data and weight records in parallel
      const [animalResult, fetchedWeightRecords] = await Promise.all([
        fetchAnimalData(animalId),
        fetchWeightRecords()
      ]);
      
      if (!isMountedRef.current) return;
      
      if (animalResult) {
        // Only create initial weight record if no records exist and animal has weight
        if (fetchedWeightRecords.length === 0 && animalResult.weight) {
          await createInitialWeightRecord(animalResult, fetchedWeightRecords);
        }
        
        // Update current weight if we have records
        updateAnimalWithCurrentWeight(animalResult, fetchedWeightRecords);
      }
      
      // Update initialDataFetchedRef after data has been fetched
      initialDataFetchedRef.current = true;
    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error("Error fetching animal data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch animal data",
        variant: "destructive"
      });
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [
    animalId, 
    userId, 
    deletedRecordIds, 
    toast, 
    fetchAnimalData, 
    fetchWeightRecords, 
    createInitialWeightRecord, 
    updateAnimalWithCurrentWeight
  ]);

  // Main effect to fetch data when relevant props change
  useEffect(() => {
    // Reset isMountedRef to true when the component mounts
    isMountedRef.current = true;
    
    const shouldFetchData = !initialDataFetchedRef.current || 
                          !animalData || 
                          animalData.id !== animalId || 
                          haveDeletedIdsChanged(prevDeletedIdsRef.current);
    
    if (shouldFetchData) {
      console.log("Fetching data because:", {
        initialDataFetched: initialDataFetchedRef.current,
        animalDataExists: !!animalData,
        idMatch: animalData?.id === animalId,
        deletedIdsChanged: haveDeletedIdsChanged(prevDeletedIdsRef.current)
      });
      
      // Update the previous deleted ids reference before fetching
      prevDeletedIdsRef.current = Array.from(deletedRecordIds);
      
      // Set loading to true before fetching data
      setLoading(true);
      fetchData();
    } else {
      console.log("Skipping data fetch - no relevant changes detected");
    }
    
    // Clean up function
    return () => {
      // Mark as unmounted to prevent state updates after unmount
      isMountedRef.current = false;
    };
  }, [animalId, userId, deletedRecordIds, fetchData, animalData, haveDeletedIdsChanged]);

  // Immediately filter records when deletedRecordIds changes
  useEffect(() => {
    if (weightRecords.length > 0) {
      console.log("Filtering weight records due to deletedRecordIds change");
      
      const filteredRecords = filterDeletedRecords(weightRecords);
      
      // Only update if the filtering actually removed something
      if (filteredRecords.length !== weightRecords.length) {
        console.log("Updating weightRecords with filtered results:", filteredRecords);
        setWeightRecords(filteredRecords);
        
        // Also update the animal's current weight if we have records
        if (filteredRecords.length > 0 && animalData) {
          updateAnimalWithCurrentWeight(animalData, filteredRecords);
        }
      }
    }
  }, [deletedRecordIds, filterDeletedRecords, weightRecords, animalData, updateAnimalWithCurrentWeight]);

  return {
    animalData,
    setAnimalData,
    weightRecords,
    setWeightRecords,
    loading,
    refetchWeightRecords
  };
};
