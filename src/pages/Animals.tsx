
import React, { useState } from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { AnimalList } from "@/components/ui/dashboard/AnimalList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid2X2, LayoutList } from "lucide-react";
import { AddAnimalDialog } from "@/components/animal/AddAnimalDialog";

const Animals = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddSuccess = () => {
    // Trigger a refresh of the animal list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <MainLayout pageTitle="Animals">
      <div className="max-w-[1600px] mx-auto animate-fade-up">
        <div className="glass-card p-8 rounded-2xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Animal Records & Management</h2>
            <div className="flex items-center gap-4">
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <Grid2X2 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view">
                  <LayoutList className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <Button 
                className="bg-reptile-500 hover:bg-reptile-600"
                onClick={() => setIsAddDialogOpen(true)}
              >
                + Add Animal
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage your animals, track health records, and monitor feeding schedules.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <AnimalList viewMode={viewMode} key={refreshTrigger} />
          </CardContent>
        </Card>

        <AddAnimalDialog 
          isOpen={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen} 
          onSuccess={handleAddSuccess} 
        />
      </div>
    </MainLayout>
  );
};

export default Animals;
