
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { deleteWeightRecord } from "@/services/weightService";
import { WeightRecord } from "./types";

export const useWeightRecordDeleter = (
  animalId: string | undefined,
  setWeightRecords: React.Dispatch<React.SetStateAction<WeightRecord[]>>,
  deletedRecordIds: Set<string>,
  setDeletedRecordIds: React.Dispatch<React.SetStateAction<Set<string>>>,
  refetchWeightRecords: () => Promise<WeightRecord[] | null>
) => {
  // Use a ref to track in-progress deletions to prevent duplicate calls
  const pendingDeletions = useRef(new Set<string>());

  // Handle delete weight record with optimistic updates
  const handleDeleteWeight = useCallback((id: string) => {
    if (!animalId || !id) return;
    
    // Skip if already in progress or already deleted
    if (pendingDeletions.current.has(id) || deletedRecordIds.has(id)) {
      return;
    }
    
    // Mark as in progress
    pendingDeletions.current.add(id);
    
    // Create new Sets to avoid reference issues
    const newDeletedIds = new Set(deletedRecordIds);
    newDeletedIds.add(id);
    
    // Update UI first (optimistic update) - use functional update
    setWeightRecords(prevRecords => prevRecords.filter(record => record.id !== id));
    setDeletedRecordIds(newDeletedIds);
    
    // Then perform the API call in the background
    deleteWeightRecord(id)
      .then(success => {
        if (success) {
          toast.success("Weight record deleted", {
            duration: 2000,
            position: "bottom-right",
          });
        } else {
          // Rollback if failed
          handleDeleteFailure(id);
        }
      })
      .catch(() => {
        handleDeleteFailure(id);
      })
      .finally(() => {
        // Clear from pending set
        pendingDeletions.current.delete(id);
      });
  }, [animalId, deletedRecordIds, setDeletedRecordIds, setWeightRecords, refetchWeightRecords]);

  // Helper for handling deletion failures
  const handleDeleteFailure = useCallback((id: string) => {
    // Rollback deleted IDs
    setDeletedRecordIds(prev => {
      const updated = new Set(prev);
      updated.delete(id);
      return updated;
    });
    
    // Refetch to restore correct data
    refetchWeightRecords();
    
    toast.error("Failed to delete weight record");
  }, [setDeletedRecordIds, refetchWeightRecords]);

  return { handleDeleteWeight };
};
