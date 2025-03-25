
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

  // Initialize deletedRecordIds set in the parent hook to maintain state across rerenders
  const [deletedRecordIds, setDeletedRecordIds] = useState<Set<string>>(new Set<string>());

  // Get animal data functionality with deletedRecordIds
  const {
    animalData,
    setAnimalData,
    weightRecords,
    setWeightRecords,
    loading
  } = useAnimalData(id, user?.id, deletedRecordIds);

  // Then get animal weight functionality with the ability to update deletedRecordIds
  const {
    isWeightDialogOpen,
    setIsWeightDialogOpen,
    handleAddWeight,
    handleDeleteWeight
  } = useAnimalWeight(id, user?.id, setAnimalData, weightRecords, setWeightRecords, deletedRecordIds, setDeletedRecordIds);

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
