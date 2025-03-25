
import { useCallback } from "react";
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
  // Delete weight record functionality with optimistic UI updates
  const handleDeleteWeight = useCallback((id: string) => {
    if (!animalId || !id) return false;
    
    console.log("Deleting weight record with ID:", id);
    
    // Check if we've already processed this delete request
    if (deletedRecordIds.has(id)) {
      console.log("Record already marked as deleted, ignoring duplicate request");
      return true;
    }
    
    // Perform optimistic UI update first - remove from UI immediately
    setWeightRecords(prevRecords => {
      return prevRecords.filter(record => record.id !== id);
    });
    
    // Add to deletedRecordIds set for tracking
    setDeletedRecordIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
    
    // Call the API without blocking the UI
    deleteWeightRecord(id)
      .then(success => {
        if (success) {
          console.log("Successfully deleted weight record ID:", id);
          toast.success("Weight record deleted", {
            duration: 2000,
            position: "bottom-right"
          });
        } else {
          console.error("Failed to delete weight record ID:", id);
          
          // Rollback UI changes if API call failed
          rollbackDeletion(id);
          
          toast.error("Failed to delete weight record");
        }
      })
      .catch(error => {
        console.error("Error deleting weight record:", error);
        
        // Rollback UI changes on error
        rollbackDeletion(id);
        
        toast.error("Failed to delete weight record");
      });
    
    return true;
  }, [animalId, setDeletedRecordIds, setWeightRecords, deletedRecordIds]);

  // Helper function to rollback deletion
  const rollbackDeletion = useCallback((id: string) => {
    // Remove from deletedRecordIds
    setDeletedRecordIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    
    // Refetch records to restore the deleted one
    refetchWeightRecords();
  }, [setDeletedRecordIds, refetchWeightRecords]);

  return { handleDeleteWeight };
};
