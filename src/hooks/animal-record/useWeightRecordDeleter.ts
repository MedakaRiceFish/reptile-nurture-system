
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
  const handleDeleteWeight = useCallback(async (id: string) => {
    if (!animalId || !id) return;
    
    try {
      console.log("Deleting weight record with ID:", id);
      
      // Perform optimistic UI update first - remove from UI immediately
      // This prevents any flicker or reload effect
      setWeightRecords(prevRecords => {
        return prevRecords.filter(record => record.id !== id);
      });
      
      // Also add to deletedRecordIds set for filtering
      setDeletedRecordIds(prev => {
        const newSet = new Set(prev);
        newSet.add(id);
        console.log(`Added ID ${id} to deletedRecordIds. New set:`, Array.from(newSet));
        return newSet;
      });
      
      // Then do the actual API call in the background
      const success = await deleteWeightRecord(id);
      
      if (success) {
        console.log("Successfully deleted weight record ID:", id);
        toast.success("The weight record has been successfully deleted");
        return true;
      } else {
        console.error("Failed to delete weight record ID:", id);
        
        // Rollback UI changes if API call failed
        const updatedRecords = await refetchWeightRecords();
        if (!updatedRecords) {
          console.error("Failed to rollback UI after failed deletion");
          toast.error("Failed to delete weight record");
        }
        
        // Remove from deletedRecordIds if API call failed
        setDeletedRecordIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        
        return false;
      }
    } catch (error: any) {
      console.error("Error deleting weight record:", error);
      
      // Rollback UI changes by refetching on error
      const updatedRecords = await refetchWeightRecords();
      if (!updatedRecords) {
        console.error("Failed to rollback UI after error during deletion");
      }
      
      // Remove from deletedRecordIds if an error occurred
      setDeletedRecordIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      toast.error("Failed to delete weight record");
      return false;
    }
  }, [animalId, setDeletedRecordIds, setWeightRecords, refetchWeightRecords]);

  return { handleDeleteWeight };
};
