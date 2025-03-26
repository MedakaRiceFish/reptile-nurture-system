
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createAnimal } from "@/services/animalService";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddAnimalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddAnimalDialog({ isOpen, onOpenChange, onSuccess }: AddAnimalDialogProps) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [feedingSchedule, setFeedingSchedule] = useState("");
  const [breederSource, setBreederSource] = useState("");
  const [description, setDescription] = useState("");
  const [customId, setCustomId] = useState("");
  const [enclosureId, setEnclosureId] = useState("none");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add an animal",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newAnimal = {
        name,
        species,
        age: parseInt(age) || 0,
        weight: parseFloat(weight) || 0,
        length: parseFloat(length) || 0,
        feeding_schedule: feedingSchedule,
        breeding_source: breederSource,
        description,
        custom_id: customId,
        owner_id: user.id,
        enclosure_id: enclosureId === "none" ? null : enclosureId,
        image_url: null,
        last_fed_date: null
      };
      
      const result = await createAnimal(newAnimal);
      
      if (result) {
        toast({
          title: "Success",
          description: `${name} has been added to your collection`
        });
        
        // Reset form
        setName("");
        setSpecies("");
        setAge("");
        setWeight("");
        setLength("");
        setFeedingSchedule("");
        setBreederSource("");
        setDescription("");
        setCustomId("");
        setEnclosureId("none");
        
        // Close dialog
        onOpenChange(false);
        
        // Trigger success callback
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while adding the animal",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Animal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
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
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Animal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
