
import React, { memo, useMemo, useCallback } from "react";
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

// Use memo to prevent unnecessary re-renders
const AnimalRecordContent = memo(({
  animal,
  animalNotes,
  setAnimalData,
  setAnimalNotes,
  onEditClick,
  onAddWeightClick,
  onDeleteWeight
}: AnimalRecordContentProps) => {
  // Memoize the delete weight handler
  const handleDeleteWeight = useCallback((id: string) => {
    if (onDeleteWeight) {
      onDeleteWeight(id);
    }
  }, [onDeleteWeight]);

  // Generate a unique key based on animal ID and data version
  const contentKey = useMemo(() => 
    `animal-content-${animal.id}-${animal.weightHistory?.length || 0}`, 
    [animal.id, animal.weightHistory?.length]
  );

  return (
    <div key={contentKey}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <AnimalDetails 
          animal={animal} 
          setAnimalData={setAnimalData} 
          onEditClick={onEditClick} 
        />

        <WeightTracker 
          animal={animal} 
          onAddWeightClick={onAddWeightClick} 
          onDeleteWeight={handleDeleteWeight}
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

export { AnimalRecordContent };
