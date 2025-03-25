
import { useState, useCallback } from "react";
import { getAnimal } from "@/services/animalService";
import { AnimalWithWeightHistory, WeightRecord } from "./types";

export const useAnimalDataManager = () => {
  const [animalData, setAnimalData] = useState<AnimalWithWeightHistory | null>(null);
  
  // Fetch animal data
  const fetchAnimalData = useCallback(async (animalId: string) => {
    try {
      console.log("Fetching animal data for ID:", animalId);
      
      const animalResult = await getAnimal(animalId);
      
      if (animalResult) {
        console.log("Fetched animal data:", animalResult);
        return animalResult;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching animal data:", error);
      return null;
    }
  }, []);
  
  // Update animal data with current weight
  const updateAnimalWithCurrentWeight = useCallback((
    animalResult: AnimalWithWeightHistory,
    filteredRecords: WeightRecord[]
  ) => {
    let animalWithUpdatedWeight = {...animalResult};
    
    if (filteredRecords.length > 0) {
      const sortedRecords = [...filteredRecords].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const currentWeight = sortedRecords[0].weight;
      animalWithUpdatedWeight.weight = currentWeight;
    }
    
    setAnimalData(animalWithUpdatedWeight);
    return animalWithUpdatedWeight;
  }, []);
  
  return {
    animalData,
    setAnimalData,
    fetchAnimalData,
    updateAnimalWithCurrentWeight
  };
};
