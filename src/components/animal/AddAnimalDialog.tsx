
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createAnimal } from "@/services/animalService";
import { useAuth } from "@/context/AuthContext";
import { AddAnimalFormFields } from "./AddAnimalFormFields";
import { AddAnimalFormActions } from "./AddAnimalFormActions";

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
        length: parseFloat(length) || null,
        feeding_schedule: feedingSchedule || null,
        breeding_source: breederSource || null,
        description: description || null,
        custom_id: customId || null,
        owner_id: user.id,
        enclosure_id: enclosureId === "none" ? null : enclosureId,
        image_url: null,
        last_fed_date: null,
        next_feeding_date: null
      };
      
      const result = await createAnimal(newAnimal);
      
      if (result) {
        toast({
          title: "Success",
          description: `${name} has been added to your collection`
        });
        
        resetForm();
        onOpenChange(false);
        
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

  const resetForm = () => {
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Animal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <AddAnimalFormFields
            name={name}
            setName={setName}
            species={species}
            setSpecies={setSpecies}
            age={age}
            setAge={setAge}
            weight={weight}
            setWeight={setWeight}
            length={length}
            setLength={setLength}
            feedingSchedule={feedingSchedule}
            setFeedingSchedule={setFeedingSchedule}
            breederSource={breederSource}
            setBreederSource={setBreederSource}
            description={description}
            setDescription={setDescription}
            customId={customId}
            setCustomId={setCustomId}
            enclosureId={enclosureId}
            setEnclosureId={setEnclosureId}
          />
          <AddAnimalFormActions onCancel={() => onOpenChange(false)} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
