
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  getAnimal, 
  updateAnimal 
} from "@/services/animalService";
import { 
  getAnimalWeightRecords, 
  addWeightRecord, 
  deleteWeightRecord,
  updateAnimalWeight
} from "@/services/weightService";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type WeightRecord = {
  id?: string;
  date: string;
  weight: number;
};

export type AnimalNote = {
  date: string;
  note: string;
};

export const useAnimalRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [animalData, setAnimalData] = useState<any>(null);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [animalNotes, setAnimalNotes] = useState<AnimalNote[]>([
    {date: format(new Date(), "yyyy-MM-dd"), note: "Initial health assessment complete. Animal appears in good condition."}
  ]);

  const fetchWeightRecords = async () => {
    if (!id) return;
    
    try {
      console.log("Fetching weight records for animal ID:", id);
      const records = await getAnimalWeightRecords(id);
      console.log("Fetched weight records:", records);
      
      setWeightRecords(records);
      
      if (records.length > 0 && animalData) {
        const sortedRecords = [...records].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const latestWeight = sortedRecords[0].weight;
        console.log("Setting latest weight from records:", latestWeight);
        
        setAnimalData(prev => ({
          ...prev,
          weight: latestWeight
        }));
        
        await updateAnimalWeight(id, latestWeight);
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
          console.log("Fetching weight records for animal ID:", id);
          const records = await getAnimalWeightRecords(id);
          console.log("Raw records from service:", records);
          
          setWeightRecords(records);
          
          if (records.length === 0 && animalData.weight) {
            console.log("No weight records but animal has weight:", animalData.weight);
            console.log("Creating initial weight record from animal weight");
            
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
                setWeightRecords([result]);
              }
            } catch (error) {
              console.error("Error creating initial weight record:", error);
            }
          }
          
          if (records.length > 0) {
            const sortedRecords = [...records].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
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
        console.log("Added new weight record:", result);
        
        setWeightRecords(prevRecords => {
          const newRecords = [...prevRecords, result];
          console.log("Updated weight records state:", newRecords);
          return newRecords;
        });
        
        const updatedAnimal = {
          ...animalData,
          weight: weightValue
        };
        
        await updateAnimalWeight(animalData.id, weightValue);
        setAnimalData(updatedAnimal);
        
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

  const handleDeleteWeight = async (id: string) => {
    if (!animalData || !id) return;
    
    try {
      console.log("Deleting weight record with ID:", id);
      const success = await deleteWeightRecord(id);
      
      if (success) {
        // Update the weight records list
        setWeightRecords(prevRecords => 
          prevRecords.filter(record => record.id !== id)
        );
        
        // Refetch weight records to get the latest data
        const updatedRecords = await getAnimalWeightRecords(animalData.id);
        
        let newWeight = 0;
        if (updatedRecords.length > 0) {
          // Sort to get the latest record
          const sortedRecords = [...updatedRecords].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          newWeight = sortedRecords[0].weight;
        }
        
        // Update the animal's weight in the state
        setAnimalData(prev => ({
          ...prev,
          weight: newWeight
        }));
        
        // Update the animal's weight in the database
        await updateAnimalWeight(animalData.id, newWeight);
        
        toast({
          title: "Weight record deleted",
          description: "The weight record has been successfully deleted"
        });
      }
    } catch (error: any) {
      console.error("Error deleting weight record:", error);
      toast({
        title: "Error",
        description: "Failed to delete weight record",
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
              .maybeSingle();
              
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

  return {
    id,
    animalData,
    weightRecords,
    loading,
    animalNotes,
    isWeightDialogOpen,
    isEditDialogOpen,
    setAnimalData,
    setAnimalNotes,
    setIsWeightDialogOpen,
    setIsEditDialogOpen,
    handleBack,
    handleAddWeight,
    handleDeleteWeight,
    handleEditSubmit
  };
};
