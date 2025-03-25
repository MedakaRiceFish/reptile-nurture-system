
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getAnimal } from "@/services/animalService";
import { getAnimalWeightRecords, addWeightRecord } from "@/services/weightService";
import { WeightRecord, AnimalWithWeightHistory } from "./types";

export const useAnimalData = (
  animalId: string | undefined,
  userId: string | undefined,
  deletedRecordIds: Set<string>
) => {
  const [animalData, setAnimalData] = useState<AnimalWithWeightHistory | null>(null);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const initialDataFetchedRef = useRef(false);
  const isMountedRef = useRef(true);
  const prevDeletedIdsLengthRef = useRef(0);

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
      const [animalResult, weightRecordsResult] = await Promise.all([
        getAnimal(animalId),
        getAnimalWeightRecords(animalId)
      ]);
      
      if (!isMountedRef.current) return;
      
      if (animalResult) {
        // Log the fetched data for debugging
        console.log("Fetched animal data:", animalResult);
        console.log("Fetched weight records:", weightRecordsResult);
        console.log("deletedRecordIds size:", deletedRecordIds.size);
        
        // Filter out deleted records once instead of on every render
        const filteredRecords = weightRecordsResult.filter(record => 
          record.id ? !deletedRecordIds.has(record.id) : true
        );
        
        console.log("Filtered weight records (after removing deleted):", filteredRecords);
        
        // Set weight records first to reduce cascading updates
        setWeightRecords(filteredRecords);
        
        // Only create initial weight record if no records exist and animal has weight
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
            addWeightRecord(newRecord).then(result => {
              if (result && isMountedRef.current) {
                setWeightRecords([result]);
              }
            });
          } catch (error) {
            console.error("Error creating initial weight record:", error);
          }
        }
        
        // Update current weight if we have records
        let animalWithUpdatedWeight = {...animalResult};
        
        if (filteredRecords.length > 0) {
          const sortedRecords = [...filteredRecords].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          const currentWeight = sortedRecords[0].weight;
          animalWithUpdatedWeight.weight = currentWeight;
        }
        
        setAnimalData(animalWithUpdatedWeight);
      }
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
        initialDataFetchedRef.current = true;
      }
    }
  }, [animalId, userId, deletedRecordIds, toast]);

  useEffect(() => {
    // Track whether the deletedRecordIds set has changed
    const currentDeletedIdsLength = deletedRecordIds.size;
    const hasDeletedIdsChanged = currentDeletedIdsLength !== prevDeletedIdsLengthRef.current;
    
    console.log("Deleted IDs length changed:", hasDeletedIdsChanged, 
      "Current:", currentDeletedIdsLength, 
      "Previous:", prevDeletedIdsLengthRef.current);
    
    // Skip if we've already fetched the initial data and nothing relevant has changed
    if (initialDataFetchedRef.current && 
        animalData && 
        animalData.id === animalId && 
        !hasDeletedIdsChanged) {
      return;
    }

    // Update the previous deleted ids length reference
    prevDeletedIdsLengthRef.current = currentDeletedIdsLength;
    
    // Set loading to true before fetching data
    setLoading(true);
    fetchData();
    
    return () => {
      // Mark as unmounted to prevent state updates after unmount
      isMountedRef.current = false;
    };
  }, [animalId, userId, deletedRecordIds, fetchData, animalData]);

  // Filter weight records client-side when deletedRecordIds changes
  useEffect(() => {
    if (weightRecords.length > 0 && deletedRecordIds.size > 0) {
      console.log("Filtering weight records based on deletedRecordIds");
      setWeightRecords(prevRecords => 
        prevRecords.filter(record => record.id ? !deletedRecordIds.has(record.id) : true)
      );
    }
  }, [deletedRecordIds]);

  return {
    animalData,
    setAnimalData,
    weightRecords,
    setWeightRecords,
    loading
  };
};
