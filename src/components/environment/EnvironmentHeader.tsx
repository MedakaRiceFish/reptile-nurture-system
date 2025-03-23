
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EnvironmentHeaderProps {
  enclosureName: string;
}

export const EnvironmentHeader: React.FC<EnvironmentHeaderProps> = ({ 
  enclosureName 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-6 flex items-center">
      <Button variant="outline" onClick={() => navigate("/enclosures")} className="mr-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <h1 className="text-3xl font-bold tracking-tight">{enclosureName}</h1>
    </div>
  );
};
