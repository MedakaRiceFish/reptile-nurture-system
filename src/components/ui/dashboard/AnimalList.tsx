
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimalCard } from "./AnimalCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Weight, Ruler } from "lucide-react";

// Initial animal data
const INITIAL_ANIMAL_DATA = [
  {
    id: 1,
    name: "Spike",
    species: "Gargoyle Gecko",
    age: 3,
    weight: 35,
    length: 20,
    enclosure: 1,
    feedingSchedule: "Every 2 days",
    image: "https://images.unsplash.com/photo-1597926599906-afd0d4a7ecbf?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    name: "Rex",
    species: "Bearded Dragon",
    age: 5,
    weight: 350,
    length: 45,
    enclosure: 2,
    feedingSchedule: "Daily",
    image: "https://images.unsplash.com/photo-1497339100210-9e87df79c218?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 3,
    name: "Monty",
    species: "Ball Python",
    age: 8,
    weight: 1200,
    length: 120,
    enclosure: 3,
    feedingSchedule: "Every 7 days",
    image: "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 4,
    name: "Leo",
    species: "Leopard Gecko",
    age: 2,
    weight: 28,
    length: 18,
    enclosure: 4,
    feedingSchedule: "Every 2 days",
    image: "https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=800&auto=format&fit=crop&q=60"
  },
];

interface AnimalListProps {
  viewMode?: "grid" | "list";
}

export function AnimalList({ viewMode = "grid" }: AnimalListProps) {
  const navigate = useNavigate();
  const [animals] = useState(INITIAL_ANIMAL_DATA);

  const handleAnimalClick = (id: number) => {
    navigate(`/animal/${id}`);
  };

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
              <TableHead>Feeding Schedule</TableHead>
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
                    {animal.length} cm
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-0.5 bg-reptile-100 text-reptile-800 rounded-full">
                    Enclosure #{animal.enclosure}
                  </span>
                </TableCell>
                <TableCell>{animal.feedingSchedule}</TableCell>
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
          >
            <AnimalCard
              animalId={animal.id}
              animalName={animal.name}
              species={animal.species}
              age={animal.age}
              weight={animal.weight}
              length={animal.length}
              image={animal.image}
              onClick={() => handleAnimalClick(animal.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
