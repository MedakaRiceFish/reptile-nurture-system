
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useAnimalData } from "./useAnimalData";
import { useAnimalWeight } from "./useAnimalWeight";
import { useAnimalEdit } from "./useAnimalEdit";
import { AnimalNote } from "./types";

export const useAnimalRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Initialize with a default note
  const [animalNotes, setAnimalNotes] = useState<AnimalNote[]>([
    {date: format(new Date(), "yyyy-MM-dd"), note: "Initial health assessment complete. Animal appears in good condition."}
  ]);

  // First get animal data functionality
  const {
    animalData,
    setAnimalData,
    weightRecords,
    setWeightRecords,
    loading
  } = useAnimalData(id, user?.id, new Set<string>());

  // Then get animal weight functionality with setAnimalData now available
  const {
    deletedRecordIds,
    isWeightDialogOpen,
    setIsWeightDialogOpen,
    handleAddWeight,
    handleDeleteWeight
  } = useAnimalWeight(id, user?.id, setAnimalData, weightRecords, setWeightRecords);

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
