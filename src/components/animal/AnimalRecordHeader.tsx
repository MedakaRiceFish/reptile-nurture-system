
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AnimalRecordHeaderProps {
  animalName: string;
  onBack: () => void;
}

export const AnimalRecordHeader: React.FC<AnimalRecordHeaderProps> = ({ 
  animalName, 
  onBack 
}) => {
  return (
    <div className="mb-6 flex items-center">
      <Button variant="outline" onClick={onBack} className="mr-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <h1 className="text-3xl font-bold tracking-tight">{animalName}</h1>
    </div>
  );
};
