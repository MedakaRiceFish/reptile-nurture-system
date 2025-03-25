
import React, { useState } from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { EnclosureList } from "@/components/ui/dashboard/EnclosureList";
import { AddEnclosureDialog } from "@/components/ui/dashboard/AddEnclosureDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid2X2, LayoutList, Plus } from "lucide-react";

const Enclosures = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <MainLayout pageTitle="Enclosures">
      <div className="max-w-[1600px] mx-auto animate-fade-up">
        <div className="glass-card p-8 rounded-2xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Enclosure & Environment Management</h2>
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
                <Plus className="h-4 w-4 mr-2" /> Add Enclosure
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage your enclosures and monitor environmental conditions in real-time.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <EnclosureList viewMode={viewMode} />
          </CardContent>
        </Card>
        
        <AddEnclosureDialog 
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      </div>
    </MainLayout>
  );
};

export default Enclosures;
