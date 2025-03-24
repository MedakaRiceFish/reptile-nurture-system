
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ANIMALS_DATA } from "@/data/animalsData";
import { EditAnimalDialog } from "@/components/animal/EditAnimalDialog";
import { AddWeightDialog } from "@/components/animal/AddWeightDialog";
import { AnimalNotFound } from "@/components/animal/AnimalNotFound";
import { AnimalRecordHeader } from "@/components/animal/AnimalRecordHeader";
import { AnimalRecordContent } from "@/components/animal/AnimalRecordContent";

const AnimalRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const animalId = parseInt(id || "0");
  const [animalData, setAnimalData] = useState(() => 
    ANIMALS_DATA.find(animal => animal.id === animalId)
  );

  const [animalNotes, setAnimalNotes] = useState<{date: string, note: string}[]>([
    {date: format(new Date(), "yyyy-MM-dd"), note: "Initial health assessment complete. Animal appears in good condition."}
  ]);

  const animal = animalData;

  const handleBack = () => {
    navigate("/animals");
  };

  const handleAddWeight = (data: any) => {
    if (!data.weight || isNaN(parseFloat(data.weight))) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value",
        variant: "destructive"
      });
      return;
    }

    if (animal && data.date) {
      const newRecord = {
        date: format(data.date, "yyyy-MM-dd"),
        weight: parseFloat(data.weight)
      };
      
      const updatedAnimal = {
        ...animal,
        weight: parseFloat(data.weight),
        weightHistory: [...animal.weightHistory, newRecord].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      };
      
      setAnimalData(updatedAnimal);
      
      toast({
        title: "Weight record added",
        description: `New weight of ${data.weight}g recorded for ${animal.name}`,
      });
      
      setIsWeightDialogOpen(false);
    }
  };

  const handleEditSubmit = (data: any) => {
    if (animal) {
      const updatedAnimal = {
        ...animal,
        name: data.name,
        species: data.species,
        age: parseInt(data.age),
        length: parseInt(data.length),
        feedingSchedule: data.feedingSchedule,
        breederSource: data.breederSource,
        description: data.description
      };
      
      setAnimalData(updatedAnimal);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Animal details updated",
        description: `${data.name}'s details have been updated successfully`,
      });
    }
  };

  if (!animal) {
    return (
      <MainLayout pageTitle="Animal Not Found">
        <AnimalNotFound id={id} onBack={handleBack} />
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle={`${animal.name} - Animal Record`}>
      <div className="max-w-[1200px] mx-auto py-6 animate-fade-up">
        <AnimalRecordHeader animalName={animal.name} onBack={handleBack} />

        <AnimalRecordContent 
          animal={animal}
          animalNotes={animalNotes}
          setAnimalData={setAnimalData}
          setAnimalNotes={setAnimalNotes}
          onEditClick={() => setIsEditDialogOpen(true)}
          onAddWeightClick={() => setIsWeightDialogOpen(true)}
        />

        <EditAnimalDialog 
          animal={animal} 
          isOpen={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          onSave={handleEditSubmit} 
        />

        <AddWeightDialog 
          isOpen={isWeightDialogOpen} 
          onOpenChange={setIsWeightDialogOpen} 
          onSave={handleAddWeight} 
        />
      </div>
    </MainLayout>
  );
};

export default AnimalRecord;
