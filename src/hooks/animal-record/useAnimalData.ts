
import { useState, useEffect, useCallback } from "react";
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
  const [isInitialDataFetched, setIsInitialDataFetched] = useState(false);

  // Memoize the data fetching function to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    if (!animalId || !userId) {
      setLoading(false);
      return;
    }

    try {
      // Use Promise.all to fetch animal data and weight records in parallel
      const [animalResult, weightRecordsResult] = await Promise.all([
        getAnimal(animalId),
        getAnimalWeightRecords(animalId)
      ]);
      
      if (animalResult) {
        // Filter out deleted records
        const filteredRecords = weightRecordsResult.filter(record => 
          record.id ? !deletedRecordIds.has(record.id) : true
        );
        
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
            
            const result = await addWeightRecord(newRecord);
            
            if (result) {
              setWeightRecords([result]);
            }
          } catch (error) {
            console.error("Error creating initial weight record:", error);
          }
        }
        
        // Update current weight if we have records
        if (filteredRecords.length > 0) {
          const sortedRecords = [...filteredRecords].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          const currentWeight = sortedRecords[0].weight;
          animalResult.weight = currentWeight;
        }
        
        setAnimalData(animalResult);
      }
    } catch (error) {
      console.error("Error fetching animal data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch animal data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsInitialDataFetched(true);
    }
  }, [animalId, userId, deletedRecordIds, toast]);

  useEffect(() => {
    // Skip the effect if we've already fetched the initial data
    // and the IDs haven't changed
    if (isInitialDataFetched && 
        animalData && 
        animalData.id === animalId && 
        Object.keys(deletedRecordIds).length === 0) {
      return;
    }

    // Set loading to true before fetching data
    setLoading(true);
    fetchData();
  }, [animalId, userId, deletedRecordIds, fetchData, isInitialDataFetched, animalData]);

  return {
    animalData,
    setAnimalData,
    weightRecords,
    setWeightRecords,
    loading
  };
};
