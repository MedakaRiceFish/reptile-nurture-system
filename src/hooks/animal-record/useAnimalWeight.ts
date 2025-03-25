
import { useState, useCallback } from "react";
import { useWeightRecordManager } from "./useWeightRecordManager";
import { useWeightRecordDeleter } from "./useWeightRecordDeleter";
import { WeightRecord } from "./types";

export const useAnimalWeight = (
  animalId: string | undefined,
  userId: string | undefined,
  setAnimalData: React.Dispatch<React.SetStateAction<any>>,
  weightRecords: WeightRecord[],
  setWeightRecords: React.Dispatch<React.SetStateAction<WeightRecord[]>>,
  deletedRecordIds: Set<string>,
  setDeletedRecordIds: React.Dispatch<React.SetStateAction<Set<string>>>,
  refetchWeightRecords: () => Promise<WeightRecord[] | null>
) => {
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);

  // Use the extracted hooks for add and delete operations
  const { handleAddWeight } = useWeightRecordManager(
    animalId,
    userId,
    setAnimalData,
    setWeightRecords,
    refetchWeightRecords
  );

  const { handleDeleteWeight } = useWeightRecordDeleter(
    animalId,
    setWeightRecords,
    deletedRecordIds,
    setDeletedRecordIds
  );

  return {
    weightRecords,
    setWeightRecords,
    isWeightDialogOpen,
    setIsWeightDialogOpen,
    handleAddWeight,
    handleDeleteWeight
  };
};
