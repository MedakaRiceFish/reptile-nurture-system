
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EnclosureSelectorProps {
  animal: any;
}

export const EnclosureSelector: React.FC<EnclosureSelectorProps> = ({
  animal
}) => {
  const navigate = useNavigate();

  // Navigate to enclosure page when name is clicked
  const handleEnclosureClick = () => {
    // Check for both enclosure and enclosure_id (snake_case from DB)
    const enclosureId = animal.enclosure || animal.enclosure_id;
    if (enclosureId) {
      navigate(`/enclosure/${enclosureId}`);
    }
  };

  // Determine if there's an enclosure assigned and what name to display
  const hasEnclosure = animal.enclosureName || animal.enclosure_name;

  return (
    <div className="flex items-center">
      {hasEnclosure ? (
        <Button 
          variant="link" 
          className="p-0 h-auto font-medium text-reptile-600"
          onClick={handleEnclosureClick}
        >
          {animal.enclosureName || animal.enclosure_name}
        </Button>
      ) : (
        <span className="text-muted-foreground">None assigned</span>
      )}
    </div>
  );
};
