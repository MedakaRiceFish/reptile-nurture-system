
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { deleteWeightRecord } from "@/services/weightService";
import { WeightRecord } from "./types";

export const useWeightRecordDeleter = (
  animalId: string | undefined,
  setWeightRecords: React.Dispatch<React.SetStateAction<WeightRecord[]>>,
  deletedRecordIds: Set<string>,
  setDeletedRecordIds: React.Dispatch<React.SetStateAction<Set<string>>>
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
    
    // Update UI first (optimistic update) - use functional update to ensure we're working with latest state
    setWeightRecords(prevRecords => prevRecords.filter(record => record.id !== id));
    setDeletedRecordIds(newDeletedIds);
    
    // Then perform the API call
    deleteWeightRecord(id)
      .then(success => {
        if (!success) {
          console.error("Failed to delete weight record:", id);
          // Don't roll back the UI - we'll let the persistence layer handle reconciliation
        }
      })
      .catch((error) => {
        console.error("Error deleting weight record:", error);
      })
      .finally(() => {
        // Clear from pending set
        pendingDeletions.current.delete(id);
      });
  }, [animalId, deletedRecordIds, setDeletedRecordIds, setWeightRecords]);

  return { handleDeleteWeight };
};
