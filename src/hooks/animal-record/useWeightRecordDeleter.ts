
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
    
    // Perform optimistic UI update first - remove from UI immediately
    setWeightRecords(prevRecords => prevRecords.filter(record => record.id !== id));
    
    // Also add to deletedRecordIds set for filtering
    setDeletedRecordIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
    
    // Then do the actual API call in the background without waiting
    deleteWeightRecord(id).then(success => {
      if (success) {
        console.log("Successfully deleted weight record ID:", id);
        toast.success("Weight record deleted", {
          duration: 2000,
          position: "bottom-right"
        });
      } else {
        console.error("Failed to delete weight record ID:", id);
        
        // Rollback UI changes if API call failed
        refetchWeightRecords();
        
        // Remove from deletedRecordIds if API call failed
        setDeletedRecordIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        
        toast.error("Failed to delete weight record");
      }
    }).catch(error => {
      console.error("Error deleting weight record:", error);
      
      // Rollback UI changes on error
      refetchWeightRecords();
      
      // Remove from deletedRecordIds on error
      setDeletedRecordIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      toast.error("Failed to delete weight record");
    });
    
    return true;
  }, [animalId, setDeletedRecordIds, setWeightRecords, refetchWeightRecords]);

  return { handleDeleteWeight };
};
