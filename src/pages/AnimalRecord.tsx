
import React, { useMemo, Suspense, lazy, useEffect, useState, useRef } from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { AnimalNotFound } from "@/components/animal/AnimalNotFound";
import { AnimalRecordHeader } from "@/components/animal/AnimalRecordHeader";
import { AnimalRecordContent } from "@/components/animal/AnimalRecordContent";
import { useAnimalRecord } from "@/hooks/animal-record/useAnimalRecord";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load dialogs to improve initial render time
const EditAnimalDialog = lazy(() => import("@/components/animal/EditAnimalDialog").then(module => ({ default: module.EditAnimalDialog })));
const AddWeightDialog = lazy(() => import("@/components/animal/AddWeightDialog").then(module => ({ default: module.AddWeightDialog })));

const AnimalRecord = () => {
  // Track render start time
  const renderStartTime = performance.now();
  
  // Use a stable ref to maintain instance identity across renders
  const contentRef = useRef(null);
  
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
    handleEditSubmit,
    deletedRecordIds
  } = useAnimalRecord();

  // Memoize the animal with weight history
  const animalWithWeightHistory = useMemo(() => {
    if (!animalData) return null;
    
    return {
      ...animalData,
      weightHistory: weightRecords
    };
  }, [animalData, weightRecords]);

  // Memoize stable identity for callbacks to prevent prop changes
  const stableCallbacks = useMemo(() => ({
    onEditClick: () => setIsEditDialogOpen(true),
    onAddWeightClick: () => setIsWeightDialogOpen(true),
    onDeleteWeight: handleDeleteWeight,
  }), [setIsEditDialogOpen, setIsWeightDialogOpen, handleDeleteWeight]);

  // Only re-create the animal key when the ID changes
  const animalKey = useMemo(() => animalData?.id || 'loading', [animalData?.id]);

  // Log render completion time in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const renderTime = performance.now() - renderStartTime;
      console.log(`AnimalRecord component render time: ${renderTime.toFixed(2)}ms`);
    }
  }, [renderStartTime]);

  // Render loading state
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

  // Render not found state
  if (!animalData) {
    return (
      <MainLayout pageTitle="Animal Not Found">
        <AnimalNotFound id={id} onBack={handleBack} />
      </MainLayout>
    );
  }

  // Main render - use stable references to prevent unnecessary re-renders
  return (
    <MainLayout pageTitle={`${animalData.name} - Animal Record`}>
      <div className="max-w-[1200px] mx-auto py-6 animate-fade-up">
        <AnimalRecordHeader animalName={animalData.name} onBack={handleBack} />
        
        <div key={animalKey} ref={contentRef}>
          <AnimalRecordContent 
            animal={animalWithWeightHistory}
            animalNotes={animalNotes}
            setAnimalData={setAnimalData}
            setAnimalNotes={setAnimalNotes}
            onEditClick={stableCallbacks.onEditClick}
            onAddWeightClick={stableCallbacks.onAddWeightClick}
            onDeleteWeight={stableCallbacks.onDeleteWeight}
          />
        </div>

        {/* Only render dialogs when they're open to reduce initial load time */}
        <Suspense fallback={null}>
          {isEditDialogOpen && (
            <EditAnimalDialog 
              animal={animalData} 
              isOpen={isEditDialogOpen} 
              onOpenChange={setIsEditDialogOpen} 
              onSave={handleEditSubmit} 
            />
          )}

          {isWeightDialogOpen && (
            <AddWeightDialog 
              isOpen={isWeightDialogOpen} 
              onOpenChange={setIsWeightDialogOpen} 
              onSave={handleAddWeight} 
            />
          )}
        </Suspense>
      </div>
    </MainLayout>
  );
};

export default React.memo(AnimalRecord);
