
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { createAnimal } from "@/services/animalService";

interface AddAnimalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddAnimalDialog: React.FC<AddAnimalDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  
  const animalForm = useForm({
    defaultValues: {
      name: "",
      species: "",
      age: "",
      length: "",
      weight: "",
      feedingSchedule: "",
      breederSource: "",
      description: ""
    }
  });

  const handleSubmit = async (data: any) => {
    if (!user) return;
    
    try {
      const animal = {
        name: data.name,
        species: data.species,
        age: parseInt(data.age) || 0,
        weight: parseFloat(data.weight) || 0,
        length: data.length ? parseInt(data.length) : null,
        feeding_schedule: data.feedingSchedule || null,
        breeding_source: data.breederSource || null,
        description: data.description || null,
        owner_id: user.id
      };
      
      const result = await createAnimal(animal);
      
      if (result) {
        onOpenChange(false);
        animalForm.reset();
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating animal:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Animal</DialogTitle>
        </DialogHeader>
        <Form {...animalForm}>
          <form onSubmit={animalForm.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={animalForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={animalForm.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Species*</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Bearded Dragon" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={animalForm.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)*</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={animalForm.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (g)*</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={animalForm.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={animalForm.control}
                name="feedingSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feeding Schedule</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Every 2 days" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={animalForm.control}
                name="breederSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breeder Source</FormLabel>
                    <FormControl>
                      <Input placeholder="Where was it acquired?" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={animalForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter some details about this animal"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Add Animal</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
