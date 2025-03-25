
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
  const handleEnclosureNameClick = () => {
    if (animal.enclosure) {
      navigate(`/enclosure/${animal.enclosure}`);
    }
  };

  return (
    <div className="flex items-center">
      {animal.enclosureName ? (
        <Button 
          variant="link" 
          className="p-0 h-auto font-medium text-reptile-600"
          onClick={handleEnclosureNameClick}
        >
          {animal.enclosureName}
        </Button>
      ) : (
        <span className="text-muted-foreground">None assigned</span>
      )}
    </div>
  );
};
