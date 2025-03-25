
import { useState, useCallback, useMemo } from "react";
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

  // Memoize the entire weightRecords value to prevent unnecessary re-renders
  const memoizedWeightRecords = useMemo(() => weightRecords, [weightRecords]);

  // Use the extracted hooks for add and delete operations with memoized dependencies
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
    weightRecords: memoizedWeightRecords,
    setWeightRecords,
    isWeightDialogOpen,
    setIsWeightDialogOpen,
    handleAddWeight,
    handleDeleteWeight
  };
};
