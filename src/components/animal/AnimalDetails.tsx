
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Camera, Edit, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

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
  const [isSearchingEnclosure, setIsSearchingEnclosure] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && animal) {
          const imageUrl = event.target.result as string;
          setImagePreview(imageUrl);
          
          setAnimalData({
            ...animal,
            image: imageUrl
          });
          
          toast({
            title: "Photo updated",
            description: `${animal.name}'s photo has been updated successfully`,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const ENCLOSURES = [
    { id: 1, name: "Desert Terrarium" },
    { id: 2, name: "Large Rock Habitat" },
    { id: 3, name: "Forest Terrarium" },
    { id: 4, name: "Small Desert Setup" },
    { id: 5, name: "Tropical Vivarium" },
    { id: 6, name: "Arid Environment" },
  ];

  const filteredEnclosures = ENCLOSURES.filter(enclosure => 
    enclosure.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="lg:col-span-1">
      <div className="relative">
        <img 
          src={imagePreview || animal.image} 
          alt={animal.name} 
          className="w-full h-[300px] object-cover rounded-t-lg"
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button size="sm" variant="secondary" className="h-8" onClick={handlePhotoButtonClick}>
            <Camera className="w-4 h-4 mr-1" />
            Upload
          </Button>
          <Button size="sm" variant="secondary" className="h-8" onClick={onEditClick}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Species:</span>
            <span className="font-medium">{animal.species}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Age:</span>
            <span className="font-medium">{animal.age} years</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Current Weight:</span>
            <span className="font-medium">{animal.weight} g</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Length:</span>
            <span className="font-medium">{animal.length} cm</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Feeding Schedule:</span>
            <span className="font-medium">{animal.feedingSchedule}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Enclosure:</span>
            <Popover open={isSearchingEnclosure} onOpenChange={setIsSearchingEnclosure}>
              <PopoverTrigger asChild>
                <Button variant="link" className="p-0 h-auto font-medium text-reptile-600">
                  {animal.enclosureName}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search enclosures..." 
                      className="h-8"
                    />
                  </div>
                  <ScrollArea className="h-72">
                    <div className="space-y-1">
                      {filteredEnclosures.map((enclosure) => (
                        <Button
                          key={enclosure.id}
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            setIsSearchingEnclosure(false);
                            if (animal) {
                              setAnimalData({
                                ...animal,
                                enclosure: enclosure.id,
                                enclosureName: enclosure.name
                              });
                              toast({
                                title: "Enclosure updated",
                                description: `${animal.name} has been moved to ${enclosure.name}`,
                              });
                            }
                          }}
                        >
                          {enclosure.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Breeder Source:</span>
            <span className="font-medium">{animal.breederSource || "Unknown"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
