
import { useAnimalRecord as useAnimalRecordImpl } from "./animal-record/useAnimalRecord";

export const useAnimalRecord = useAnimalRecordImpl;

// Export types and other utilities from the original module
export type { WeightRecord, AnimalNote } from "./animal-record/types";
export * from "./animal-record/types";
