
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useAnimalData } from "./useAnimalData";
import { useAnimalWeight } from "./useAnimalWeight";
import { useAnimalEdit } from "./useAnimalEdit";
import { AnimalNote, WeightRecord } from "./types";
import { toast } from "sonner";

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

  // Load deletedRecordIds from localStorage with better error handling
  const [deletedRecordIds, setDeletedRecordIds] = useState<Set<string>>(() => {
    if (!id) return new Set<string>();
    
    try {
      console.log(`Initializing deletedRecordIds from localStorage for animal ${id}`);
      const storageKey = getDeletedRecordsStorageKey(id);
      const storedDeletedIds = localStorage.getItem(storageKey);
      
      if (storedDeletedIds) {
        const parsedIds = JSON.parse(storedDeletedIds);
        if (Array.isArray(parsedIds)) {
          console.log(`Retrieved ${parsedIds.length} deleted records from localStorage for animal ${id}:`, parsedIds);
          // Filter out any null or undefined values for safety
          const validIds = parsedIds.filter(idVal => idVal && typeof idVal === 'string');
          return new Set<string>(validIds);
        } else {
          console.warn(`Invalid deletedRecordIds format in localStorage for animal ${id}:`, parsedIds);
        }
      } else {
        console.log(`No deleted records found in localStorage for animal ${id}`);
      }
    } catch (error) {
      console.error("Error retrieving deleted records from localStorage:", error);
    }
    
    return new Set<string>();
  });

  // Save deletedRecordIds to localStorage whenever it changes with better error handling
  const persistDeletedRecordsToLocalStorage = useCallback(() => {
    if (!id) return;
    
    try {
      const deletedIdsArray = Array.from(deletedRecordIds);
      const storageKey = getDeletedRecordsStorageKey(id);
      
      // Save even if empty (to clear previous data)
      localStorage.setItem(storageKey, JSON.stringify(deletedIdsArray));
      console.log(`Saved ${deletedIdsArray.length} deletedRecordIds to localStorage for animal ${id}:`, deletedIdsArray);
    } catch (error) {
      console.error("Error saving deleted records to localStorage:", error);
      toast.error("Failed to save deleted records. Some records may reappear on page refresh.");
    }
  }, [id, deletedRecordIds]);

  // Persist to localStorage whenever deletedRecordIds changes
  useEffect(() => {
    if (deletedRecordIds.size > 0) {
      console.log(`Persisting ${deletedRecordIds.size} deletedRecordIds to localStorage`);
    }
    persistDeletedRecordsToLocalStorage();
  }, [persistDeletedRecordsToLocalStorage, deletedRecordIds]);

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
    deletedRecordIds,
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
