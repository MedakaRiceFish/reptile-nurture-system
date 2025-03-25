
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
  // Handle delete weight record
  const handleDeleteWeight = useCallback((id: string) => {
    if (!animalId || !id) return;
    
    // Check if already marked as deleted
    if (deletedRecordIds.has(id)) {
      return;
    }
    
    // Create new Sets/Arrays to avoid reference issues
    const newDeletedIds = new Set(deletedRecordIds);
    newDeletedIds.add(id);
    
    // Update UI immediately by filtering out the deleted record
    setWeightRecords(currentRecords => 
      currentRecords.filter(record => record.id !== id)
    );
    
    // Update deleted IDs record
    setDeletedRecordIds(newDeletedIds);
    
    // Call API to delete the record
    deleteWeightRecord(id)
      .then(success => {
        if (success) {
          toast.success("Weight record deleted", {
            duration: 2000,
            position: "bottom-right",
          });
        } else {
          // Rollback UI changes
          setDeletedRecordIds(current => {
            const updatedIds = new Set(current);
            updatedIds.delete(id);
            return updatedIds;
          });
          
          // Refetch to restore the correct data
          refetchWeightRecords();
          
          toast.error("Failed to delete weight record");
        }
      })
      .catch(() => {
        // Rollback UI changes
        setDeletedRecordIds(current => {
          const updatedIds = new Set(current);
          updatedIds.delete(id);
          return updatedIds;
        });
        
        // Refetch to restore the correct data
        refetchWeightRecords();
        
        toast.error("Failed to delete weight record");
      });
  }, [animalId, deletedRecordIds, setDeletedRecordIds, setWeightRecords, refetchWeightRecords]);

  return { handleDeleteWeight };
};
