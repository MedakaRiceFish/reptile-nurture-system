
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
  // Delete weight record functionality
  const handleDeleteWeight = useCallback(async (id: string) => {
    if (!animalId || !id) return;
    
    try {
      console.log("Deleting weight record with ID:", id);
      
      // Add to deletedRecordIds immediately for optimistic UI update
      setDeletedRecordIds(prev => {
        // Create a new Set with all previous values plus the new one
        const newSet = new Set(prev);
        newSet.add(id);
        console.log(`Added ID ${id} to deletedRecordIds. New set:`, Array.from(newSet));
        return newSet;
      });
      
      // Update UI by filtering out the deleted record
      setWeightRecords(prevRecords => {
        return prevRecords.filter(record => record.id !== id);
      });
      
      // Now do the actual API call
      const success = await deleteWeightRecord(id);
      
      if (success) {
        console.log("Successfully deleted weight record ID:", id);
        
        // Extra logging to ensure the state update worked
        setTimeout(() => {
          console.log("Current deletedRecordIds after deletion:", Array.from(deletedRecordIds));
        }, 0);
        
        // Notify user of success
        toast.success("The weight record has been successfully deleted");
      } else {
        console.error("Failed to delete weight record ID:", id);
        
        // Remove from deletedRecordIds if API call failed
        setDeletedRecordIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        
        // Rollback UI changes
        refetchWeightRecords();
        
        toast.error("Failed to delete weight record");
      }
    } catch (error: any) {
      console.error("Error deleting weight record:", error);
      
      // Remove from deletedRecordIds if an error occurred
      setDeletedRecordIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      // Rollback optimistic UI update
      refetchWeightRecords();
      
      toast.error("Failed to delete weight record");
    }
  }, [animalId, deletedRecordIds, setDeletedRecordIds, setWeightRecords, refetchWeightRecords]);

  return { handleDeleteWeight };
};
