
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EnvironmentNotFoundProps {
  id?: string;  // Make id optional
}

export const EnvironmentNotFound: React.FC<EnvironmentNotFoundProps> = ({ id }) => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Enclosure Not Found</h2>
        <p className="mb-6">We couldn't find an enclosure with the ID {id || 'provided'}.</p>
        <Button onClick={() => navigate("/enclosures")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Enclosures
        </Button>
      </div>
    </div>
  );
};
