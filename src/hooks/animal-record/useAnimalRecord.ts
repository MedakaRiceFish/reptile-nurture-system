
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useAnimalData } from "./useAnimalData";
import { useAnimalWeight } from "./useAnimalWeight";
import { useAnimalEdit } from "./useAnimalEdit";
import { AnimalNote, WeightRecord } from "./types";

// Create a storage key for deleted records that's unique per animal
const getDeletedRecordsStorageKey = (animalId: string) => 
  `animal_${animalId}_deleted_records`;

export const useAnimalRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Initialize with a default note
  const [animalNotes, setAnimalNotes] = useState<AnimalNote[]>([
    {date: format(new Date(), "yyyy-MM-dd"), note: "Initial health assessment complete. Animal appears in good condition."}
  ]);

  // Initialize deletedRecordIds from localStorage if available
  const [deletedRecordIds, setDeletedRecordIds] = useState<Set<string>>(() => {
    if (!id) return new Set<string>();
    
    try {
      const storedDeletedIds = localStorage.getItem(getDeletedRecordsStorageKey(id));
      if (storedDeletedIds) {
        return new Set<string>(JSON.parse(storedDeletedIds));
      }
    } catch (error) {
      console.error("Error retrieving deleted records from localStorage:", error);
    }
    
    return new Set<string>();
  });

  // Save deletedRecordIds to localStorage whenever it changes
  useEffect(() => {
    if (!id || deletedRecordIds.size === 0) return;
    
    try {
      const deletedIdsArray = Array.from(deletedRecordIds);
      localStorage.setItem(getDeletedRecordsStorageKey(id), JSON.stringify(deletedIdsArray));
      console.log("Saved deletedRecordIds to localStorage:", deletedIdsArray);
    } catch (error) {
      console.error("Error saving deleted records to localStorage:", error);
    }
  }, [id, deletedRecordIds]);

  // Get animal data functionality with deletedRecordIds
  const {
    animalData,
    setAnimalData,
    weightRecords,
    setWeightRecords,
    loading,
    refetchWeightRecords
  } = useAnimalData(id, user?.id, deletedRecordIds);

  // Then get animal weight functionality with the ability to update deletedRecordIds
  const {
    isWeightDialogOpen,
    setIsWeightDialogOpen,
    handleAddWeight,
    handleDeleteWeight
  } = useAnimalWeight(
    id, 
    user?.id, 
    setAnimalData, 
    weightRecords, 
    setWeightRecords, 
    deletedRecordIds, 
    setDeletedRecordIds,
    refetchWeightRecords
  );

  // Get animal edit functionality
  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleEditSubmit
  } = useAnimalEdit(setAnimalData);

  const handleBack = () => {
    navigate("/animals");
  };

  // Wrapper for handleEditSubmit to include the animal ID
  const handleEditSubmitWrapper = async (data: any) => {
    if (!animalData) return;
    await handleEditSubmit(data, animalData.id);
  };

  return {
    id,
    animalData,
    weightRecords,
    loading,
    animalNotes,
    isWeightDialogOpen,
    isEditDialogOpen,
    setAnimalData,
    setAnimalNotes,
    setIsWeightDialogOpen,
    setIsEditDialogOpen,
    handleBack,
    handleAddWeight,
    handleDeleteWeight,
    handleEditSubmit: handleEditSubmitWrapper
  };
};

// Export this for backward compatibility
export type { WeightRecord, AnimalNote } from "./types";
export * from "./types";
