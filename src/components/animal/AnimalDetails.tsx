
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/supabase-storage";
import { supabase } from "@/integrations/supabase/client";
import { PhotoUploadButton } from "./PhotoUploadButton";
import { EnclosureSelector } from "./EnclosureSelector";
import { DetailsItem } from "./DetailsItem";

interface AnimalDetailsProps {
  animal: any;
  setAnimalData: React.Dispatch<React.SetStateAction<any>>;
  onEditClick: () => void;
}

export const AnimalDetails: React.FC<AnimalDetailsProps> = ({
  animal,
  setAnimalData,
  onEditClick,
}) => {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // If animal has enclosure_id but no enclosureName, fetch the enclosure name
    const fetchEnclosureName = async () => {
      if (animal?.enclosure_id && !animal.enclosureName) {
        try {
          const { data, error } = await supabase
            .from('enclosures')
            .select('name')
            .eq('id', animal.enclosure_id)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setAnimalData({
              ...animal,
              enclosureName: data.name,
              enclosure: animal.enclosure_id // ensure both properties exist
            });
          }
        } catch (error) {
          console.error('Error fetching enclosure name:', error);
        }
      }
    };
    
    fetchEnclosureName();
  }, [animal, setAnimalData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          
          setAnimalData({
            ...animal,
            image_url: url
          });
          
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
      setAnimalData({
        ...animal,
        image: imagePreview
      });
      
      toast({
        title: "Photo updated",
        description: `${animal.name}'s photo has been updated successfully`,
      });
    }
  };

  return (
    <Card className="lg:col-span-1">
      <div className="relative">
        <img 
          src={imagePreview || animal.image_url || animal.image} 
          alt={animal.name} 
          className="w-full h-[300px] object-cover rounded-t-lg"
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
            {animal.weight} g
          </DetailsItem>
          
          <DetailsItem label="Length">
            {animal.length} cm
          </DetailsItem>
          
          <DetailsItem label="Feeding Schedule">
            {animal.feeding_schedule || animal.feedingSchedule}
          </DetailsItem>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Enclosure:</span>
            <EnclosureSelector animal={animal} />
          </div>
          
          <DetailsItem label="Breeder Source">
            {animal.breeding_source || animal.breederSource || "Unknown"}
          </DetailsItem>
        </div>
      </CardContent>
    </Card>
  );
};
