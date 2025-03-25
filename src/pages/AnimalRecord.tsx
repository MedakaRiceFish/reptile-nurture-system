
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
import { getAnimalWeightRecords, addWeightRecord, getLatestWeightRecord } from "@/services/weightService";
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

  // Function to fetch and update weight records
  const fetchWeightRecords = async () => {
    if (!id) return;
    
    try {
      console.log("Fetching weight records for animal ID:", id);
      const records = await getAnimalWeightRecords(id);
      console.log("Fetched weight records:", records);
      
      setWeightRecords(records);
      
      // Update animal's current weight if we have weight records
      if (records.length > 0 && animalData) {
        // Sort by date (newest first)
        const sortedRecords = [...records].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const latestWeight = sortedRecords[0].weight;
        console.log("Setting latest weight from records:", latestWeight);
        
        // Update animal data with the latest weight
        setAnimalData(prev => ({
          ...prev,
          weight: latestWeight
        }));
        
        // Also update the weight in the database
        await updateAnimal(id, { weight: latestWeight });
      }
    } catch (error) {
      console.error("Error fetching weight records:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        console.log("Fetching animal data for ID:", id);
        const animalData = await getAnimal(id);
        
        if (animalData) {
          // Fetch weight records
          console.log("Fetching weight records for animal ID:", id);
          const records = await getAnimalWeightRecords(id);
          console.log("Raw records from service:", records);
          
          // If we have weight records, update the state
          setWeightRecords(records);
          
          // If no weight records but the animal has a weight, create a weight record for today
          if (records.length === 0 && animalData.weight) {
            console.log("No weight records but animal has weight:", animalData.weight);
            console.log("Creating initial weight record from animal weight");
            
            // Only add the weight record if we're not in the middle of adding it
            // (to prevent duplicate records when useEffect runs multiple times)
            const today = format(new Date(), "yyyy-MM-dd");
            
            try {
              const newRecord = {
                animal_id: animalData.id,
                weight: animalData.weight,
                recorded_at: today,
                owner_id: user.id
              };
              
              const result = await addWeightRecord(newRecord);
              
              if (result) {
                console.log("Initial weight record created:", result);
                
                // Add the new record to our state
                const formattedRecord = {
                  date: today,
                  weight: animalData.weight
                };
                
                setWeightRecords([formattedRecord]);
              }
            } catch (error) {
              console.error("Error creating initial weight record:", error);
            }
          }
          
          // Make sure the animalData has the latest weight value from records
          if (records.length > 0) {
            // Sort by date, newest first
            const sortedRecords = [...records].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            // Use most recent weight for the animal's current weight
            const currentWeight = sortedRecords[0].weight;
            animalData.weight = currentWeight;
          }
          
          setAnimalData(animalData);
          console.log("Animal data loaded with weight history:", { 
            animalData, 
            weightRecords: records 
          });
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
      const weightValue = parseFloat(data.weight);
      const recordDate = format(data.date, "yyyy-MM-dd");
      
      console.log("Adding new weight record:", {
        animalId: animalData.id,
        weight: weightValue,
        date: recordDate
      });
      
      const newRecord = {
        animal_id: animalData.id,
        weight: weightValue,
        recorded_at: recordDate,
        owner_id: user.id
      };
      
      const result = await addWeightRecord(newRecord);
      
      if (result) {
        const formattedRecord = {
          date: recordDate,
          weight: weightValue
        };
        
        console.log("Added new weight record:", formattedRecord);
        
        // Update weightRecords state
        setWeightRecords(prevRecords => {
          const newRecords = [...prevRecords, formattedRecord];
          console.log("Updated weight records state:", newRecords);
          return newRecords;
        });
        
        // Update animal data with new weight
        const updatedAnimal = {
          ...animalData,
          weight: weightValue
        };
        
        await updateAnimal(animalData.id, { weight: weightValue });
        setAnimalData(updatedAnimal);
        
        // Force refresh the weight records to ensure everything is up to date
        await fetchWeightRecords();
        
        toast({
          title: "Weight record added",
          description: `New weight of ${weightValue}g recorded for ${animalData.name}`,
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
  console.log("Weight records before passing to components:", weightRecords);

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
