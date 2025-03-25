
import React, { memo, useCallback } from "react";
import { AnimalDetails } from "@/components/animal/AnimalDetails";
import { WeightTracker } from "@/components/animal/WeightTracker";
import { NotesSection } from "@/components/animal/NotesSection";
import { WeightRecord } from "@/hooks/animal-record/types";

interface AnimalRecordContentProps {
  animal: {
    id: string;
    name: string;
    species: string;
    age: number;
    weight: number;
    length: number | null;
    enclosure_id: string;
    image_url?: string;
    image?: string;
    description?: string;
    feeding_schedule?: string;
    feedingSchedule?: string;
    breeding_source?: string;
    breederSource?: string;
    enclosureName?: string;
    enclosure?: string;
    weightHistory?: WeightRecord[];
  };
  animalNotes: {date: string, note: string}[];
  setAnimalData: React.Dispatch<React.SetStateAction<any>>;
  setAnimalNotes: React.Dispatch<React.SetStateAction<{date: string, note: string}[]>>;
  onEditClick: () => void;
  onAddWeightClick: () => void;
  onDeleteWeight?: (id: string) => void;
}

// Create a separate memoized component for the content
const AnimalRecordContent = memo(({
  animal,
  animalNotes,
  setAnimalData,
  setAnimalNotes,
  onEditClick,
  onAddWeightClick,
  onDeleteWeight
}: AnimalRecordContentProps) => {
  console.log(`[AnimalRecordContent] Rendering for animal: ${animal.id}, with ${animal.weightHistory?.length || 0} weight records`);
  
  // Wrap the deletion handler to ensure consistent handling
  const handleWeightDelete = useCallback((id: string) => {
    console.log(`[AnimalRecordContent] Delegating weight deletion for record: ${id}`);
    if (onDeleteWeight) {
      onDeleteWeight(id);
    }
  }, [onDeleteWeight]);
  
  return (
    <div className="transition-all duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <AnimalDetails 
          animal={animal} 
          setAnimalData={setAnimalData} 
          onEditClick={onEditClick} 
        />

        <WeightTracker 
          animal={animal} 
          onAddWeightClick={onAddWeightClick} 
          onDeleteWeight={handleWeightDelete}
        />
      </div>

      <NotesSection 
        animal={animal} 
        animalNotes={animalNotes} 
        setAnimalNotes={setAnimalNotes} 
      />
    </div>
  );
});

AnimalRecordContent.displayName = "AnimalRecordContent";

// Export as both named and default export to prevent import issues
export default AnimalRecordContent;
export { AnimalRecordContent };
