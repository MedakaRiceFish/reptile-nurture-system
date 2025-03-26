
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddAnimalFormFieldsProps {
  name: string;
  setName: (value: string) => void;
  species: string;
  setSpecies: (value: string) => void;
  age: string;
  setAge: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
  length: string;
  setLength: (value: string) => void;
  feedingSchedule: string;
  setFeedingSchedule: (value: string) => void;
  breederSource: string;
  setBreederSource: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  customId: string;
  setCustomId: (value: string) => void;
  enclosureId: string;
  setEnclosureId: (value: string) => void;
}

export const AddAnimalFormFields: React.FC<AddAnimalFormFieldsProps> = ({
  name,
  setName,
  species,
  setSpecies,
  age,
  setAge,
  weight,
  setWeight,
  length,
  setLength,
  feedingSchedule,
  setFeedingSchedule,
  breederSource,
  setBreederSource,
  description,
  setDescription,
  customId,
  setCustomId,
  enclosureId,
  setEnclosureId,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="species">Species *</Label>
        <Input
          id="species"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="age">Age (years)</Label>
        <Input
          id="age"
          type="number"
          min="0"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="weight">Weight (g) *</Label>
        <Input
          id="weight"
          type="number"
          min="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="length">Length (cm)</Label>
        <Input
          id="length"
          type="number"
          min="0"
          value={length}
          onChange={(e) => setLength(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customId">Custom ID (max 10 chars)</Label>
        <Input
          id="customId"
          value={customId}
          onChange={(e) => setCustomId(e.target.value)}
          maxLength={10}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="feedingSchedule">Feeding Schedule</Label>
        <Input
          id="feedingSchedule"
          value={feedingSchedule}
          onChange={(e) => setFeedingSchedule(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="breederSource">Breeder Source</Label>
        <Input
          id="breederSource"
          value={breederSource}
          onChange={(e) => setBreederSource(e.target.value)}
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="enclosure">Enclosure</Label>
        <Select
          value={enclosureId}
          onValueChange={setEnclosureId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select enclosure" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {/* Here would be a map of enclosures */}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </div>
  );
};
