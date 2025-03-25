
import { useCallback } from "react";
import { WeightRecord } from "./types";

/**
 * Utility hook for filtering deleted weight records
 */
export const useDeletedRecords = (deletedRecordIds: Set<string>) => {
  // Function to filter out deleted records
  const filterDeletedRecords = useCallback((records: WeightRecord[]) => {
    if (!records || !Array.isArray(records)) {
      console.error("Invalid records passed to filterDeletedRecords:", records);
      return [];
    }
    
    // Log all the record IDs we're checking against
    console.log("Filtering with deletedRecordIds:", Array.from(deletedRecordIds));
    
    // Make sure we're properly checking for null/undefined records
    const validRecords = records.filter(record => record && record.id);
    
    // Now filter out records with IDs in deletedRecordIds
    const filteredRecords = validRecords.filter(record => {
      const isDeleted = record.id && deletedRecordIds.has(record.id);
      if (isDeleted) {
        console.log(`Filtering out deleted record:`, record);
      }
      return !isDeleted;
    });
    
    console.log(`Filtered ${records.length - filteredRecords.length} deleted records out of ${records.length} total records`);
    return filteredRecords;
  }, [deletedRecordIds]);

  // Check if the deletedRecordIds set has changed
  const haveDeletedIdsChanged = useCallback((prevDeletedIds: string[]) => {
    const currentDeletedIdsArray = Array.from(deletedRecordIds).sort();
    const prevDeletedIdsArray = [...prevDeletedIds].sort();
    
    if (currentDeletedIdsArray.length !== prevDeletedIdsArray.length) {
      return true;
    }
    
    for (let i = 0; i < currentDeletedIdsArray.length; i++) {
      if (currentDeletedIdsArray[i] !== prevDeletedIdsArray[i]) {
        return true;
      }
    }
    
    return false;
  }, [deletedRecordIds]);

  return {
    filterDeletedRecords,
    haveDeletedIdsChanged
  };
};
