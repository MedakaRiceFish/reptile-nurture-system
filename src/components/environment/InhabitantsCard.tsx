
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Turtle } from "lucide-react";
import { ANIMALS_DATA } from "@/data/animalsData";

interface InhabitantsCardProps {
  inhabitants: Array<{
    id: number;
    name: string;
    species: string;
    age: string;
  }>;
}

export const InhabitantsCard: React.FC<InhabitantsCardProps> = ({ inhabitants }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <Users className="h-5 w-5 mr-2 text-muted-foreground" />
          Inhabitants
        </CardTitle>
        <CardDescription>
          Animals living in this enclosure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inhabitants.map((animal) => {
            const animalData = ANIMALS_DATA.find(a => a.name === animal.name) || 
                            { id: animal.id, name: animal.name };
            
            return (
              <Link 
                key={animal.name} 
                to={`/animal/${animalData.id}`}
                className="flex items-center p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-reptile-100 flex items-center justify-center mr-3">
                  <Turtle className="h-5 w-5 text-reptile-500" />
                </div>
                <div>
                  <h4 className="font-medium">{animal.name}</h4>
                  <p className="text-sm text-muted-foreground">{animal.species} • {animal.age}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
