
import React, { useState, useEffect } from "react";
import { AnimalCard } from "./AnimalCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Weight, Ruler, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAnimals, Animal } from "@/services/animalService";
import { useAuth } from "@/context/AuthContext";
import { getShortenedId } from "@/utils/idFormatters";
import { format } from "date-fns";

interface AnimalListProps {
  viewMode?: "grid" | "list";
}

export function AnimalList({ viewMode = "grid" }: AnimalListProps) {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnimals = async () => {
      if (user) {
        setLoading(true);
        const data = await getAnimals();
        setAnimals(data);
        setLoading(false);
      }
    };

    fetchAnimals();
  }, [user]);

  const handleAnimalClick = (id: string) => {
    navigate(`/animal/${id}`);
  };

  const formatLastFedDate = (date: string | null) => {
    if (!date) return "Not recorded";
    return format(new Date(date), "MMM d, yyyy");
  };

  if (loading) {
    return <div className="py-8 text-center">Loading animals...</div>;
  }

  if (animals.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground mb-4">No animals found. Add your first animal to get started!</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Species</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Length</TableHead>
              <TableHead>Enclosure</TableHead>
              <TableHead>Last Fed</TableHead>
              <TableHead>Next Feeding</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {animals.map((animal) => (
              <TableRow 
                key={animal.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleAnimalClick(animal.id)}
              >
                <TableCell className="font-medium">{animal.name}</TableCell>
                <TableCell>{animal.species}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {animal.age} years
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4" />
                    {animal.weight} g
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    {animal.length ? `${animal.length} cm` : "--"}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-0.5 bg-reptile-100 text-reptile-800 rounded-full">
                    {animal.enclosure_id ? `#${getShortenedId(animal.enclosure_id)}` : "None"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4" />
                    {formatLastFedDate(animal.last_fed_date)}
                  </div>
                </TableCell>
                <TableCell>
                  {animal.next_feeding_date ? 
                    format(new Date(animal.next_feeding_date), "MMM d, yyyy") : 
                    "Not scheduled"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {animals.map((animal) => (
          <div 
            key={animal.id} 
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => handleAnimalClick(animal.id)}
          >
            <AnimalCard
              animalId={animal.id}
              animalName={animal.name}
              species={animal.species}
              age={animal.age}
              weight={animal.weight}
              length={animal.length}
              lastFedDate={animal.last_fed_date}
              customId={animal.custom_id}
              nextFeedingDate={animal.next_feeding_date}
              image={animal.image_url || "https://images.unsplash.com/photo-1597926599906-afd0d4a7ecbf?w=800&auto=format&fit=crop&q=60"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
