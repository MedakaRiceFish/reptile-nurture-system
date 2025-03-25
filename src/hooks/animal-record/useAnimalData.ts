
import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Skip the effect if we've already fetched the initial data
    // and the IDs haven't changed
    if (isInitialDataFetched && 
        animalData && 
        animalData.id === animalId && 
        Object.keys(deletedRecordIds).length === 0) {
      return;
    }

    const fetchData = async () => {
      if (!animalId || !userId) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching animal data for ID:", animalId);
        const animalData = await getAnimal(animalId);
        
        if (animalData) {
          console.log("Fetching weight records for animal ID:", animalId);
          const records = await getAnimalWeightRecords(animalId);
          console.log("Raw records from service:", records);
          
          // Filter out any previously deleted records
          const filteredRecords = records.filter(record => 
            record.id ? !deletedRecordIds.has(record.id) : true
          );
          
          setWeightRecords(filteredRecords);
          
          if (filteredRecords.length === 0 && animalData.weight) {
            console.log("No weight records but animal has weight:", animalData.weight);
            console.log("Creating initial weight record from animal weight");
            
            const today = format(new Date(), "yyyy-MM-dd");
            
            try {
              const newRecord = {
                animal_id: animalData.id,
                weight: animalData.weight,
                recorded_at: today,
                owner_id: userId
              };
              
              const result = await addWeightRecord(newRecord);
              
              if (result) {
                console.log("Initial weight record created:", result);
                setWeightRecords([result]);
              }
            } catch (error) {
              console.error("Error creating initial weight record:", error);
            }
          }
          
          if (filteredRecords.length > 0) {
            const sortedRecords = [...filteredRecords].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            const currentWeight = sortedRecords[0].weight;
            animalData.weight = currentWeight;
          }
          
          setAnimalData(animalData);
          console.log("Animal data loaded with weight history:", { 
            animalData, 
            weightRecords: filteredRecords 
          });
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
    };

    // Set loading to true before fetching data
    setLoading(true);
    fetchData();
  }, [animalId, userId, deletedRecordIds, toast, isInitialDataFetched, animalData]);

  return {
    animalData,
    setAnimalData,
    weightRecords,
    setWeightRecords,
    loading
  };
};
