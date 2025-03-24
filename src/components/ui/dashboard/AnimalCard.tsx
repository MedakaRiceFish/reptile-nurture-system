
import React from "react";
import { 
  Ruler, 
  Weight, 
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface AnimalCardProps {
  animalId: string | number;
  animalName: string;
  species: string;
  age: number;
  weight: number;
  length: number | string;
  image?: string;
  className?: string;
  onClick?: () => void;
}

export function AnimalCard({
  animalId,
  animalName,
  species,
  age,
  weight,
  length,
  image,
  className,
  onClick
}: AnimalCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/animal/${animalId}`);
    }
  };

  // Format length to display properly regardless of type
  const displayLength = typeof length === 'number' ? length : parseFloat(length || '0');

  return (
    <div 
      className={cn("animal-card overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md", className)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${animalName}`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {image && (
        <div className="h-40 overflow-hidden">
          <img 
            src={image} 
            alt={animalName} 
            className="w-full h-full object-cover" 
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{animalName}</h3>
          <span className="text-xs px-2 py-0.5 bg-reptile-100 text-reptile-800 rounded-full">
            {species}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 mb-1 text-muted-foreground" />
            <span className="text-sm font-medium">
              {age} yr
            </span>
            <span className="text-xs text-muted-foreground">Age</span>
          </div>
          
          <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
            <Weight className="h-4 w-4 mb-1 text-muted-foreground" />
            <span className="text-sm font-medium">
              {weight} g
            </span>
            <span className="text-xs text-muted-foreground">Weight</span>
          </div>

          <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
            <Ruler className="h-4 w-4 mb-1 text-muted-foreground" />
            <span className="text-sm font-medium">
              {displayLength} cm
            </span>
            <span className="text-xs text-muted-foreground">Length</span>
          </div>
        </div>
      </div>
    </div>
  );
}
