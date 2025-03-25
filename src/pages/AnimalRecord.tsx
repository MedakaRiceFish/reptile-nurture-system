
import React from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { EditAnimalDialog } from "@/components/animal/EditAnimalDialog";
import { AddWeightDialog } from "@/components/animal/AddWeightDialog";
import { AnimalNotFound } from "@/components/animal/AnimalNotFound";
import { AnimalRecordHeader } from "@/components/animal/AnimalRecordHeader";
import { AnimalRecordContent } from "@/components/animal/AnimalRecordContent";
import { useAnimalRecord } from "@/hooks/useAnimalRecord";
import { Skeleton } from "@/components/ui/skeleton";

const AnimalRecord = () => {
  const {
    id,
    animalData,
    weightRecords,
    loading,
    animalNotes,
    isWeightDialogOpen,
    isEditDialogOpen,
    setAnimalData,
    setAnimalNotes,
    setIsWeightDialogOpen,
    setIsEditDialogOpen,
    handleBack,
    handleAddWeight,
    handleDeleteWeight,
    handleEditSubmit
  } = useAnimalRecord();

  if (loading) {
    return (
      <MainLayout pageTitle="Loading Animal Record">
        <div className="max-w-[1200px] mx-auto py-8">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-24 mr-4" />
            <Skeleton className="h-10 w-64" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-[500px] w-full" />
            <Skeleton className="h-[500px] w-full lg:col-span-2" />
          </div>
          
          <Skeleton className="h-[300px] w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!animalData) {
    return (
      <MainLayout pageTitle="Animal Not Found">
        <AnimalNotFound id={id} onBack={handleBack} />
      </MainLayout>
    );
  }

  const animalWithWeightHistory = {
    ...animalData,
    weightHistory: weightRecords
  };

  return (
    <MainLayout pageTitle={`${animalData.name} - Animal Record`}>
      <div className="max-w-[1200px] mx-auto py-6 animate-fade-up">
        <AnimalRecordHeader animalName={animalData.name} onBack={handleBack} />

        <AnimalRecordContent 
          animal={animalWithWeightHistory}
          animalNotes={animalNotes}
          setAnimalData={setAnimalData}
          setAnimalNotes={setAnimalNotes}
          onEditClick={() => setIsEditDialogOpen(true)}
          onAddWeightClick={() => setIsWeightDialogOpen(true)}
          onDeleteWeight={handleDeleteWeight}
        />

        <EditAnimalDialog 
          animal={animalData} 
          isOpen={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          onSave={handleEditSubmit} 
        />

        <AddWeightDialog 
          isOpen={isWeightDialogOpen} 
          onOpenChange={setIsWeightDialogOpen} 
          onSave={handleAddWeight} 
        />
      </div>
    </MainLayout>
  );
};

export default AnimalRecord;
