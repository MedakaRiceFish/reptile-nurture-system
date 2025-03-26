
import React from "react";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";
import { updateLastFedDate } from "@/services/animalService";
import { useToast } from "@/hooks/use-toast";

interface FeedButtonProps {
  animalId: string;
  onFeedingUpdated: (updatedAnimal: any) => void;
}

export const FeedButton: React.FC<FeedButtonProps> = ({ animalId, onFeedingUpdated }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleFeedClick = async () => {
    try {
      setIsLoading(true);
      const updatedAnimal = await updateLastFedDate(animalId);
      
      if (updatedAnimal) {
        onFeedingUpdated(updatedAnimal);
      }
    } catch (error) {
      console.error("Error updating feeding date:", error);
      toast({
        title: "Error",
        description: "Failed to record feeding",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleFeedClick}
      disabled={isLoading}
    >
      <UtensilsCrossed className="w-3.5 h-3.5 mr-1.5" />
      {isLoading ? "Updating..." : "Feed Now"}
    </Button>
  );
};
