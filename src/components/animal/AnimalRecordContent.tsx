
import React from "react";
import { AnimalDetails } from "@/components/animal/AnimalDetails";
import { WeightTracker } from "@/components/animal/WeightTracker";
import { NotesSection } from "@/components/animal/NotesSection";

interface AnimalRecordContentProps {
  animal: any;
  animalNotes: {date: string, note: string}[];
  setAnimalData: React.Dispatch<React.SetStateAction<any>>;
  setAnimalNotes: React.Dispatch<React.SetStateAction<{date: string, note: string}[]>>;
  onEditClick: () => void;
  onAddWeightClick: () => void;
}

export const AnimalRecordContent: React.FC<AnimalRecordContentProps> = ({
  animal,
  animalNotes,
  setAnimalData,
  setAnimalNotes,
  onEditClick,
  onAddWeightClick
}) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <AnimalDetails 
          animal={animal} 
          setAnimalData={setAnimalData} 
          onEditClick={onEditClick} 
        />

        <WeightTracker 
          animal={animal} 
          onAddWeightClick={onAddWeightClick} 
        />
      </div>

      <NotesSection 
        animal={animal} 
        animalNotes={animalNotes} 
        setAnimalNotes={setAnimalNotes} 
      />
    </>
  );
};
