
import { useCallback, useRef, useEffect } from "react";
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
  
  // Add debug counter to track hook re-initialization
  const hookInstanceId = useRef(Math.random().toString(36).substring(7));
  
  useEffect(() => {
    console.log(`[DEBUG] useWeightRecordDeleter hook initialized with ID: ${hookInstanceId.current}`);
    return () => console.log(`[DEBUG] useWeightRecordDeleter hook with ID ${hookInstanceId.current} unmounting`);
  }, []);

  // Log whenever deletedRecordIds changes
  useEffect(() => {
    console.log(`[DEBUG] deletedRecordIds changed in useWeightRecordDeleter ${hookInstanceId.current}:`, 
      Array.from(deletedRecordIds).slice(0, 3) + (deletedRecordIds.size > 3 ? '... and more' : ''));
  }, [deletedRecordIds]);

  // Handle delete weight record with optimistic updates
  const handleDeleteWeight = useCallback((id: string) => {
    console.log(`[DEBUG] handleDeleteWeight called for record ID: ${id}`);
    if (!animalId || !id) {
      console.log(`[DEBUG] Abort deletion - missing animalId or recordId`);
      return;
    }
    
    // Skip if already in progress or already deleted
    if (pendingDeletions.current.has(id) || deletedRecordIds.has(id)) {
      console.log(`[DEBUG] Skipping deletion for already-deleted or in-progress record: ${id}`);
      return;
    }
    
    // Mark as in progress
    pendingDeletions.current.add(id);
    console.log(`[DEBUG] Added record ${id} to pendingDeletions`);
    
    // Use a separate function for the update to prevent context captures
    const performOptimisticUpdate = () => {
      console.log(`[DEBUG] Performing optimistic UI update for record deletion: ${id}`);
      
      setWeightRecords(prevRecords => {
        console.log(`[DEBUG] Current weight records count before filter: ${prevRecords.length}`);
        const filteredRecords = prevRecords.filter(record => record.id !== id);
        console.log(`[DEBUG] Filtered weight records count: ${filteredRecords.length}`);
        return filteredRecords;
      });
      
      setDeletedRecordIds(prevIds => {
        console.log(`[DEBUG] Current deletedRecordIds count: ${prevIds.size}`);
        const newIds = new Set(prevIds);
        newIds.add(id);
        console.log(`[DEBUG] New deletedRecordIds count: ${newIds.size}`);
        return newIds;
      });
    };
    
    // Perform the optimistic update
    console.log(`[DEBUG] Calling performOptimisticUpdate() for record: ${id}`);
    performOptimisticUpdate();
    
    // Then perform the API call without affecting UI state again
    console.log(`[DEBUG] Making API call to delete record: ${id}`);
    deleteWeightRecord(id)
      .then(success => {
        if (!success) {
          console.error(`[DEBUG] Failed to delete weight record: ${id}`);
        } else {
          console.log(`[DEBUG] Successfully deleted weight record: ${id}`);
        }
      })
      .catch((error) => {
        console.error(`[DEBUG] Error deleting weight record: ${id}`, error);
      })
      .finally(() => {
        // Clear from pending set
        pendingDeletions.current.delete(id);
        console.log(`[DEBUG] Removed record ${id} from pendingDeletions`);
      });
  }, [animalId, deletedRecordIds, setDeletedRecordIds, setWeightRecords]);

  return { handleDeleteWeight };
};
