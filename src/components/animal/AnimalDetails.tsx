
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/supabase-storage";
import { supabase } from "@/integrations/supabase/client";
import { PhotoUploadButton } from "./PhotoUploadButton";
import { EnclosureSelector } from "./EnclosureSelector";
import { DetailsItem } from "./DetailsItem";
import { format, parseISO } from "date-fns";
import { FeedButton } from "./FeedButton";

interface AnimalDetailsProps {
  animal: any;
  setAnimalData: React.Dispatch<React.SetStateAction<any>>;
  onEditClick: () => void;
}

export const AnimalDetails: React.FC<AnimalDetailsProps> = React.memo(({
  animal,
  setAnimalData,
  onEditClick,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Use a dependency array to prevent useEffect from running on every render
  useEffect(() => {
    // Only fetch enclosure name if animal has enclosure_id but no enclosureName
    if (!animal?.enclosure_id || animal.enclosureName) return;
    
    let isMounted = true;
    
    const fetchEnclosureName = async () => {
      try {
        const { data, error } = await supabase
          .from('enclosures')
          .select('name')
          .eq('id', animal.enclosure_id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data && isMounted) {
          setAnimalData((prevData: any) => ({
            ...prevData,
            enclosureName: data.name,
            enclosure: animal.enclosure_id // ensure both properties exist
          }));
        }
      } catch (error) {
        console.error('Error fetching enclosure name:', error);
      }
    };
    
    fetchEnclosureName();
    
    return () => {
      isMounted = false;
    };
  }, [animal?.enclosure_id, setAnimalData]);

  // Memoize currentWeight calculation to avoid recalculating on every render
  const currentWeight = useMemo(() => {
    if (animal.weightHistory && animal.weightHistory.length > 0) {
      // Sort weight records by date (newest first)
      const sortedRecords = [...animal.weightHistory].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return sortedRecords[0].weight;
    }
    return animal.weight || 0;
  }, [animal.weightHistory, animal.weight]);

  // Memoize the file change handler to avoid recreating on every render
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    if (animal?.id && typeof animal.id === 'string') {
      const publicUrl = await uploadImage(file, `animals/${animal.id}`, async (url) => {
        try {
          const { error } = await supabase
            .from('animals')
            .update({ image_url: url })
            .eq('id', animal.id);
            
          if (error) throw error;
          
          setAnimalData((prevData: any) => ({
            ...prevData,
            image_url: url
          }));
          
          toast({
            title: "Photo updated",
            description: `${animal.name}'s photo has been updated successfully`,
          });
        } catch (error: any) {
          console.error('Error updating animal image URL:', error);
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive"
          });
        }
      });
      
      if (!publicUrl) {
        setImagePreview(null);
      }
    } else {
      setAnimalData((prevData: any) => ({
        ...prevData,
        image: imagePreview
      }));
      
      toast({
        title: "Photo updated",
        description: `${animal.name}'s photo has been updated successfully`,
      });
    }
  }, [animal?.id, animal?.name, setAnimalData, toast]);

  // Memoize displayLength to avoid recalculating on every render
  const displayLength = useMemo(() => {
    return animal.length ? 
      (typeof animal.length === 'number' ? animal.length : parseFloat(String(animal.length) || '0')) : 
      "--";
  }, [animal.length]);

  // Format the last fed date
  const formattedLastFedDate = useMemo(() => {
    if (!animal.last_fed_date) return "Not recorded";
    return format(new Date(animal.last_fed_date), "MMM d, yyyy");
  }, [animal.last_fed_date]);
  
  // Format the next feeding date
  const formattedNextFeedingDate = useMemo(() => {
    if (!animal.next_feeding_date) return "Not scheduled";
    return format(parseISO(animal.next_feeding_date), "MMM d, yyyy h:mm a");
  }, [animal.next_feeding_date]);
  
  // Format the feeding schedule for display
  const formattedFeedingSchedule = useMemo(() => {
    if (!animal.feeding_schedule) return "Not set";
    
    try {
      const [interval, frequency] = animal.feeding_schedule.split(':');
      if (interval && frequency) {
        return `Every ${interval} ${frequency}`;
      }
      return animal.feeding_schedule;
    } catch (error) {
      console.error("Error formatting feeding schedule:", error);
      return animal.feeding_schedule;
    }
  }, [animal.feeding_schedule]);
  
  // Handler for when feeding is updated
  const handleFeedingUpdated = useCallback((updatedAnimal: any) => {
    setAnimalData((prevData: any) => ({
      ...prevData,
      ...updatedAnimal
    }));
  }, [setAnimalData]);

  return (
    <Card className="lg:col-span-1">
      <div className="relative">
        <img 
          src={imagePreview || animal.image_url || animal.image} 
          alt={animal.name} 
          className="w-full h-[300px] object-cover rounded-t-lg"
          loading="lazy" 
          fetchPriority="high" // Add fetch priority for important images
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <PhotoUploadButton onFileChange={handleFileChange} />
          <Button size="sm" variant="secondary" className="h-8" onClick={onEditClick}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          <DetailsItem label="Species">
            {animal.species}
          </DetailsItem>
          
          <DetailsItem label="Age">
            {animal.age} years
          </DetailsItem>
          
          <DetailsItem label="Current Weight">
            {currentWeight} g
          </DetailsItem>
          
          <DetailsItem label="Length">
            {displayLength === "--" ? displayLength : `${displayLength} cm`}
          </DetailsItem>
          
          <DetailsItem 
            label="Feeding Schedule"
            action={
              <FeedButton 
                animalId={animal.id} 
                onFeedingUpdated={handleFeedingUpdated} 
              />
            }
          >
            {formattedFeedingSchedule}
          </DetailsItem>
          
          <DetailsItem label="Last Fed Date">
            {formattedLastFedDate}
          </DetailsItem>
          
          <DetailsItem label="Next Feeding">
            {formattedNextFeedingDate}
          </DetailsItem>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Enclosure:</span>
            <EnclosureSelector animal={animal} />
          </div>
          
          <DetailsItem label="Breeder Source">
            {animal.breeding_source || animal.breederSource || "Unknown"}
          </DetailsItem>
          
          <DetailsItem label="Custom ID">
            {animal.custom_id || "Not set"}
          </DetailsItem>
        </div>
      </CardContent>
    </Card>
  );
});
