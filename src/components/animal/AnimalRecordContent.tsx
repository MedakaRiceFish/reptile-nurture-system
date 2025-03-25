
import React, { memo, useEffect, useRef } from "react";
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
  // Add instance ID for tracking renders
  const instanceId = useRef(Math.random().toString(36).substring(7));
  
  useEffect(() => {
    console.log(`[DEBUG-Render] AnimalRecordContent mounted with ID: ${instanceId.current}`);
    console.log(`[DEBUG-Render] Animal data received:`, {
      id: animal.id,
      name: animal.name,
      weightHistoryCount: animal.weightHistory?.length || 0,
      callbacksProvided: {
        onEditClick: !!onEditClick,
        onAddWeightClick: !!onAddWeightClick,
        onDeleteWeight: !!onDeleteWeight
      }
    });
    
    return () => {
      console.log(`[DEBUG-Render] AnimalRecordContent with ID ${instanceId.current} unmounting`);
    };
  }, []);
  
  // Log whenever animal or weightHistory changes
  useEffect(() => {
    console.log(`[DEBUG-Render] AnimalRecordContent ${instanceId.current} received animal data update:`, {
      animalId: animal.id,
      weightHistoryCount: animal.weightHistory?.length || 0
    });
  }, [animal]);

  // Log whenever callbacks change
  useEffect(() => {
    console.log(`[DEBUG-Render] AnimalRecordContent ${instanceId.current} callbacks updated`);
  }, [onEditClick, onAddWeightClick, onDeleteWeight]);
  
  console.log(`[DEBUG-Render] AnimalRecordContent ${instanceId.current} rendering`);
  
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
          onDeleteWeight={onDeleteWeight}
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
