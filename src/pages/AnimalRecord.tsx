
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { EditAnimalDialog } from "@/components/animal/EditAnimalDialog";
import { AddWeightDialog } from "@/components/animal/AddWeightDialog";
import { AnimalNotFound } from "@/components/animal/AnimalNotFound";
import { AnimalRecordHeader } from "@/components/animal/AnimalRecordHeader";
import { AnimalRecordContent } from "@/components/animal/AnimalRecordContent";
import { getAnimal, updateAnimal } from "@/services/animalService";
import { getAnimalWeightRecords, addWeightRecord } from "@/services/weightService";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const AnimalRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [animalData, setAnimalData] = useState<any>(null);
  const [weightRecords, setWeightRecords] = useState<{date: string, weight: number}[]>([]);
  const [loading, setLoading] = useState(true);

  const [animalNotes, setAnimalNotes] = useState<{date: string, note: string}[]>([
    {date: format(new Date(), "yyyy-MM-dd"), note: "Initial health assessment complete. Animal appears in good condition."}
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        const animalData = await getAnimal(id);
        
        if (animalData) {
          setAnimalData(animalData);

          const records = await getAnimalWeightRecords(id);
          console.log("Raw records from service:", records);
          setWeightRecords(records);
          
          console.log("Weight records loaded:", records);
        }
      } catch (error) {
        console.error("Error fetching animal data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch animal data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, toast]);

  const handleBack = () => {
    navigate("/animals");
  };

  const handleAddWeight = async (data: any) => {
    if (!data.weight || isNaN(parseFloat(data.weight)) || !user || !animalData) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value",
        variant: "destructive"
      });
      return;
    }

    try {
      const newRecord = {
        animal_id: animalData.id,
        weight: parseFloat(data.weight),
        recorded_at: format(data.date, "yyyy-MM-dd"),
        owner_id: user.id
      };
      
      const result = await addWeightRecord(newRecord);
      
      if (result) {
        const formattedRecord = {
          date: format(data.date, "yyyy-MM-dd"),
          weight: parseFloat(data.weight)
        };
        
        setWeightRecords([...weightRecords, formattedRecord].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
        
        const updatedAnimal = {
          ...animalData,
          weight: parseFloat(data.weight)
        };
        
        await updateAnimal(animalData.id, { weight: parseFloat(data.weight) });
        setAnimalData(updatedAnimal);
        
        toast({
          title: "Weight record added",
          description: `New weight of ${data.weight}g recorded for ${animalData.name}`,
        });
        
        setIsWeightDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error adding weight record:", error);
      toast({
        title: "Error",
        description: "Failed to add weight record",
        variant: "destructive"
      });
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (!animalData || !user) return;
    
    try {
      const updatedAnimal = {
        name: data.name,
        species: data.species,
        age: parseInt(data.age),
        length: parseInt(data.length),
        feeding_schedule: data.feedingSchedule,
        breeding_source: data.breederSource,
        description: data.description,
        enclosure_id: data.enclosure_id === "none" ? null : data.enclosure_id
      };
      
      const result = await updateAnimal(animalData.id, updatedAnimal);
      
      if (result) {
        let enclosureName = "";
        
        if (data.enclosure_id && data.enclosure_id !== "none") {
          try {
            const { data: enclosureData } = await supabase
              .from('enclosures')
              .select('name')
              .eq('id', data.enclosure_id)
              .single();
              
            if (enclosureData) {
              enclosureName = enclosureData.name;
            }
          } catch (error) {
            console.error("Error fetching enclosure name:", error);
          }
        }
        
        setAnimalData({
          ...animalData,
          ...updatedAnimal,
          enclosureName: enclosureName
        });
        
        setIsEditDialogOpen(false);
        
        toast({
          title: "Animal details updated",
          description: `${data.name}'s details have been updated successfully`,
        });
      }
    } catch (error: any) {
      console.error("Error updating animal:", error);
      toast({
        title: "Error",
        description: "Failed to update animal details",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <MainLayout pageTitle="Loading Animal Record">
        <div className="max-w-[1200px] mx-auto py-8 text-center">
          <p>Loading animal data...</p>
        </div>
      </MainLayout>
    );
  }

  if (!animalData) {
    return (
      <MainLayout pageTitle="Animal Not Found">
        <AnimalNotFound id={id} onBack={handleBack} />
      </MainLayout>
    );
  }

  const animalWithWeightHistory = {
    ...animalData,
    weightHistory: weightRecords
  };

  console.log("Animal with weight history:", animalWithWeightHistory);

  return (
    <MainLayout pageTitle={`${animalData.name} - Animal Record`}>
      <div className="max-w-[1200px] mx-auto py-6 animate-fade-up">
        <AnimalRecordHeader animalName={animalData.name} onBack={handleBack} />

        <AnimalRecordContent 
          animal={animalWithWeightHistory}
          animalNotes={animalNotes}
          setAnimalData={setAnimalData}
          setAnimalNotes={setAnimalNotes}
          onEditClick={() => setIsEditDialogOpen(true)}
          onAddWeightClick={() => setIsWeightDialogOpen(true)}
        />

        <EditAnimalDialog 
          animal={animalData} 
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
