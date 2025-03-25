
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface EnclosureSelectorProps {
  animal: any;
  enclosures: { id: string; name: string }[];
  setAnimalData: React.Dispatch<React.SetStateAction<any>>;
}

export const EnclosureSelector: React.FC<EnclosureSelectorProps> = ({
  animal,
  enclosures,
  setAnimalData
}) => {
  const [isSearchingEnclosure, setIsSearchingEnclosure] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredEnclosures = enclosures.filter(enclosure => 
    enclosure.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Navigate to enclosure page when name is clicked
  const handleEnclosureNameClick = () => {
    if (animal.enclosure) {
      navigate(`/enclosure/${animal.enclosure}`);
    }
  };

  return (
    <div className="flex items-center">
      <Button 
        variant="link" 
        className="p-0 h-auto font-medium text-reptile-600"
        onClick={handleEnclosureNameClick}
      >
        {animal.enclosureName}
      </Button>
      
      <Popover open={isSearchingEnclosure} onOpenChange={setIsSearchingEnclosure}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2 h-6 w-6 p-0 rounded-full"
          >
            <Search className="h-3 w-3" />
            <span className="sr-only">Change enclosure</span>
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
                    onClick={async () => {
                      setIsSearchingEnclosure(false);
                      
                      if (animal.id && typeof animal.id === 'string') {
                        try {
                          const { error } = await supabase
                            .from('animals')
                            .update({ 
                              enclosure_id: enclosure.id,
                              updated_at: new Date().toISOString()
                            })
                            .eq('id', animal.id);
                            
                          if (error) throw error;
                        } catch (error: any) {
                          console.error('Error updating animal enclosure:', error);
                          toast({
                            title: "Update failed",
                            description: error.message,
                            variant: "destructive"
                          });
                          return;
                        }
                      }
                      
                      setAnimalData({
                        ...animal,
                        enclosure: enclosure.id,
                        enclosureName: enclosure.name
                      });
                      
                      toast({
                        title: "Enclosure updated",
                        description: `${animal.name} has been moved to ${enclosure.name}`,
                      });
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
  );
};
