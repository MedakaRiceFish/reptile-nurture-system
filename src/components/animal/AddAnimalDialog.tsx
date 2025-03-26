
import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { X, Save } from "lucide-react";
import { Animal, createAnimal } from "@/services/animalService";

interface AddAnimalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAnimalAdded: (animal: Animal) => void;
}

export function AddAnimalDialog({
  isOpen,
  onClose,
  onAnimalAdded,
}: AddAnimalDialogProps) {
  const { user } = useAuth();
  const form = useForm({
    defaultValues: {
      name: "",
      species: "",
      age: "1",
      weight: "0",
      length: "",
      feedingSchedule: "",
      breederSource: "",
      description: "",
    },
  });

  const handleSubmit = async (values: any) => {
    if (!user) return;

    const newAnimalData = {
      name: values.name,
      species: values.species,
      age: Number(values.age),
      weight: Number(values.weight),
      length: values.length ? Number(values.length) : null,
      feeding_schedule: values.feedingSchedule,
      breeding_source: values.breederSource,
      description: values.description,
      owner_id: user.id,
      enclosure_id: null,
      image_url: null,
      last_fed_date: null,
    };

    const animal = await createAnimal(newAnimalData);
    
    if (animal) {
      onAnimalAdded(animal);
      onClose();
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Animal</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Example: Rex" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Species</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Example: Ball Python" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" step="0.1" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (g)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="feedingSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feeding Schedule</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Example: Every 7 days" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="breederSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breeder Source</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Where you got the animal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea 
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Additional notes about this animal"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Add Animal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
