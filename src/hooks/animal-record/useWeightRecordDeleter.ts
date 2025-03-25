
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
      console.log(`Skipping deletion for already-deleted or in-progress record: ${id}`);
      return;
    }
    
    // Mark as in progress
    pendingDeletions.current.add(id);
    
    try {
      // Optimistic UI update as a single operation
      setWeightRecords(prevRecords => prevRecords.filter(record => record.id !== id));
      setDeletedRecordIds(prevIds => {
        const newIds = new Set(prevIds);
        newIds.add(id);
        return newIds;
      });
      
      // Then perform the API call
      deleteWeightRecord(id)
        .then(success => {
          if (!success) {
            console.error("Failed to delete weight record:", id);
            // We're not rolling back UI - persistence layer will handle reconciliation
          }
        })
        .catch((error) => {
          console.error("Error deleting weight record:", error);
        })
        .finally(() => {
          // Clear from pending set
          pendingDeletions.current.delete(id);
        });
    } catch (error) {
      // Error handling
      console.error("Error in delete weight operation:", error);
      pendingDeletions.current.delete(id);
    }
  }, [animalId, deletedRecordIds, setDeletedRecordIds, setWeightRecords]);

  return { handleDeleteWeight };
};
