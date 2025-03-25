
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
  const prevDeletedIdsRef = useRef<string[]>([]);

  // Function to filter out deleted records - ensure it's comprehensive and working
  const filterDeletedRecords = useCallback((records: WeightRecord[]) => {
    if (!records || !Array.isArray(records)) {
      console.error("Invalid records passed to filterDeletedRecords:", records);
      return [];
    }
    
    // Log all the record IDs we're checking against
    console.log("Filtering with deletedRecordIds:", Array.from(deletedRecordIds));
    
    // Make sure we're properly checking for null/undefined records
    const validRecords = records.filter(record => record && record.id);
    
    // Now filter out records with IDs in deletedRecordIds
    const filteredRecords = validRecords.filter(record => {
      const isDeleted = record.id && deletedRecordIds.has(record.id);
      if (isDeleted) {
        console.log(`Filtering out deleted record:`, record);
      }
      return !isDeleted;
    });
    
    console.log(`Filtered ${records.length - filteredRecords.length} deleted records out of ${records.length} total records`);
    return filteredRecords;
  }, [deletedRecordIds]);

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
        
        // Filter out deleted records
        const filteredRecords = filterDeletedRecords(weightRecordsResult);
        
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
                console.log("Created initial weight record:", result);
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
  }, [animalId, userId, deletedRecordIds, toast, filterDeletedRecords]);

  // Function to refetch just weight records
  const refetchWeightRecords = useCallback(async () => {
    if (!animalId || !userId || !isMountedRef.current) return null;
    
    try {
      console.log("Refetching weight records for animal ID:", animalId);
      
      const weightRecordsResult = await getAnimalWeightRecords(animalId);
      
      if (!isMountedRef.current) return null;
      
      console.log("Refetched weight records:", weightRecordsResult);
      console.log("Current deletedRecordIds for filtering:", Array.from(deletedRecordIds));
      
      // Filter out deleted records
      const filteredRecords = filterDeletedRecords(weightRecordsResult);
      console.log("Refetched and filtered weight records:", filteredRecords);
      
      setWeightRecords(filteredRecords);
      
      // Update animal's current weight if we have records
      if (filteredRecords.length > 0 && animalData) {
        const sortedRecords = [...filteredRecords].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const currentWeight = sortedRecords[0].weight;
        setAnimalData(prevData => prevData ? {...prevData, weight: currentWeight} : null);
      }
      
      return filteredRecords;
    } catch (error) {
      console.error("Error refetching weight records:", error);
      return null;
    }
  }, [animalId, userId, animalData, filterDeletedRecords, deletedRecordIds]);

  // Check if the deletedRecordIds set has changed
  const haveDeletedIdsChanged = useCallback(() => {
    const currentDeletedIdsArray = Array.from(deletedRecordIds).sort();
    const prevDeletedIdsArray = [...prevDeletedIdsRef.current].sort();
    
    if (currentDeletedIdsArray.length !== prevDeletedIdsArray.length) {
      return true;
    }
    
    for (let i = 0; i < currentDeletedIdsArray.length; i++) {
      if (currentDeletedIdsArray[i] !== prevDeletedIdsArray[i]) {
        return true;
      }
    }
    
    return false;
  }, [deletedRecordIds]);

  // Main effect to fetch data when relevant props change
  useEffect(() => {
    // Reset isMountedRef to true when the component mounts
    isMountedRef.current = true;
    
    const shouldFetchData = !initialDataFetchedRef.current || 
                          !animalData || 
                          animalData.id !== animalId || 
                          haveDeletedIdsChanged();
    
    if (shouldFetchData) {
      console.log("Fetching data because:", {
        initialDataFetched: initialDataFetchedRef.current,
        animalDataExists: !!animalData,
        idMatch: animalData?.id === animalId,
        deletedIdsChanged: haveDeletedIdsChanged()
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
      }
    }
  }, [deletedRecordIds, filterDeletedRecords, weightRecords]);

  return {
    animalData,
    setAnimalData,
    weightRecords,
    setWeightRecords,
    loading,
    refetchWeightRecords
  };
};
