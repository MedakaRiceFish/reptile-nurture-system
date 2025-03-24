
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AnimalNotFoundProps {
  id: string | undefined;
  onBack: () => void;
}

export const AnimalNotFound: React.FC<AnimalNotFoundProps> = ({ id, onBack }) => {
  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Animal Not Found</h2>
        <p className="mb-6">We couldn't find an animal with the ID {id}.</p>
        <Button onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Animals
        </Button>
      </div>
    </div>
  );
};
