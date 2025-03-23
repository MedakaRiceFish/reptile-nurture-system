
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ANIMALS_DATA } from "@/data/animalsData";
import { AnimalDetails } from "@/components/animal/AnimalDetails";
import { WeightTracker } from "@/components/animal/WeightTracker";
import { NotesSection } from "@/components/animal/NotesSection";
import { EditAnimalDialog } from "@/components/animal/EditAnimalDialog";
import { AddWeightDialog } from "@/components/animal/AddWeightDialog";

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
        <div className="max-w-[1200px] mx-auto py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Animal Not Found</h2>
            <p className="mb-6">We couldn't find an animal with the ID {id}.</p>
            <Button onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Animals
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle={`${animal.name} - Animal Record`}>
      <div className="max-w-[1200px] mx-auto py-6 animate-fade-up">
        <div className="mb-6 flex items-center">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{animal.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <AnimalDetails 
            animal={animal} 
            setAnimalData={setAnimalData} 
            onEditClick={() => setIsEditDialogOpen(true)} 
          />

          <WeightTracker 
            animal={animal} 
            onAddWeightClick={() => setIsWeightDialogOpen(true)} 
          />
        </div>

        <NotesSection 
          animal={animal} 
          animalNotes={animalNotes} 
          setAnimalNotes={setAnimalNotes} 
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
