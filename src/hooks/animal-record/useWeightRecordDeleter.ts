
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
    console.log(`[useWeightRecordDeleter] Handling delete for record ID: ${id}`);
    
    if (!animalId || !id) {
      console.log(`[useWeightRecordDeleter] Abort deletion - missing animalId or recordId`);
      return;
    }
    
    // Skip if already in progress or already deleted
    if (pendingDeletions.current.has(id) || deletedRecordIds.has(id)) {
      console.log(`[useWeightRecordDeleter] Skipping deletion for already processing record: ${id}`);
      return;
    }
    
    // Mark as in progress
    pendingDeletions.current.add(id);
    
    // Capture original records for rollback if needed (before closure is created)
    // This prevents stale closure issues
    const performOptimisticUpdate = () => {
      console.log(`[useWeightRecordDeleter] Performing optimistic UI update for record: ${id}`);
      
      // Update UI optimistically - remove record from display
      setWeightRecords(prevRecords => {
        return prevRecords.filter(record => record.id !== id);
      });
      
      // Track deleted ID
      setDeletedRecordIds(prevIds => {
        const newIds = new Set(prevIds);
        newIds.add(id);
        return newIds;
      });
    };
    
    // Perform the optimistic update first
    performOptimisticUpdate();
    
    // Then perform the API call
    console.log(`[useWeightRecordDeleter] Making API call to delete record: ${id}`);
    deleteWeightRecord(id)
      .then(success => {
        if (success) {
          console.log(`[useWeightRecordDeleter] Successfully deleted record: ${id}`);
          // Successfully deleted - already reflected in UI
        } else {
          console.error(`[useWeightRecordDeleter] Failed to delete record: ${id}`);
          toast.error("Failed to delete weight record. Please try again.");
        }
      })
      .catch((error) => {
        console.error(`[useWeightRecordDeleter] Error deleting record: ${id}`, error);
        toast.error("Error deleting weight record. Please try again.");
      })
      .finally(() => {
        // Clear from pending set regardless of outcome
        pendingDeletions.current.delete(id);
        console.log(`[useWeightRecordDeleter] Removed record ${id} from pendingDeletions`);
      });
  }, [animalId, deletedRecordIds, setDeletedRecordIds, setWeightRecords]);

  return { handleDeleteWeight };
};
