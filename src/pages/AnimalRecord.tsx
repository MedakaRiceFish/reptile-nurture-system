import React, { useMemo, Suspense, lazy, useEffect, useState, useRef, useCallback } from "react";
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
  // Debug - track render count
  const renderCount = useRef(0);
  const componentId = useRef(Math.random().toString(36).substring(7));
  
  // Log component render
  console.log(`[DEBUG-Render] AnimalRecord component ${componentId.current} rendering (count: ${++renderCount.current})`);
  
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
    handleEditSubmit
  } = useAnimalRecord();

  // Log hook data
  useEffect(() => {
    console.log(`[DEBUG-Data] AnimalRecord ${componentId.current} useAnimalRecord returned:`, {
      id,
      animalDataExists: !!animalData,
      weightRecordsCount: weightRecords?.length || 0,
      loading,
      dialogStates: { isWeightDialogOpen, isEditDialogOpen }
    });
  }, [id, animalData, weightRecords?.length, loading, isWeightDialogOpen, isEditDialogOpen]);

  // Track deletedRecordIds changes
  useEffect(() => {
    if (animalData) {
      console.log(`[DEBUG-Render] AnimalRecord ${componentId.current} for animal: ${animalData.name}`);
    }
  }, [animalData]);

  // Memoize the animal with weight history
  const animalWithWeightHistory = useMemo(() => {
    if (!animalData) {
      console.log(`[DEBUG-Render] AnimalRecord ${componentId.current} - no animal data available`);
      return null;
    }
    
    const result = {
      ...animalData,
      weightHistory: weightRecords
    };
    
    console.log(`[DEBUG-Render] AnimalRecord ${componentId.current} memoized animalWithWeightHistory:`, {
      id: result.id,
      name: result.name,
      weightHistoryCount: weightRecords?.length || 0
    });
    
    return result;
  }, [animalData, weightRecords]);

  // Wrap handleDeleteWeight with debugging
  const handleDeleteWeightWithDebug = useCallback((id: string) => {
    console.log(`[DEBUG-Action] AnimalRecord ${componentId.current} - handleDeleteWeight called for id: ${id}`);
    handleDeleteWeight(id);
  }, [handleDeleteWeight]);

  // Memoize stable identity for callbacks to prevent prop changes
  const stableCallbacks = useMemo(() => {
    const callbacks = {
      onEditClick: () => {
        console.log(`[DEBUG-Action] AnimalRecord ${componentId.current} - onEditClick called`);
        setIsEditDialogOpen(true);
      },
      onAddWeightClick: () => {
        console.log(`[DEBUG-Action] AnimalRecord ${componentId.current} - onAddWeightClick called`);
        setIsWeightDialogOpen(true);
      },
      onDeleteWeight: handleDeleteWeightWithDebug,
    };
    
    console.log(`[DEBUG-Render] AnimalRecord ${componentId.current} - memoized stableCallbacks`);
    return callbacks;
  }, [setIsEditDialogOpen, setIsWeightDialogOpen, handleDeleteWeightWithDebug]);

  // Only re-create the animal key when the ID changes
  const animalKey = useMemo(() => {
    const key = animalData?.id || 'loading';
    console.log(`[DEBUG-Render] AnimalRecord ${componentId.current} - generated animalKey: ${key}`);
    return key;
  }, [animalData?.id]);

  // Log render completion time in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const renderTime = performance.now() - renderStartTime;
      console.log(`[DEBUG-Performance] AnimalRecord component ${componentId.current} render time: ${renderTime.toFixed(2)}ms`);
    }
    
    return () => {
      console.log(`[DEBUG-Render] AnimalRecord component ${componentId.current} unmounting`);
    };
  }, [renderStartTime]);

  // Render loading state
  if (loading) {
    console.log(`[DEBUG-Render] AnimalRecord ${componentId.current} rendering loading state`);
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
    console.log(`[DEBUG-Render] AnimalRecord ${componentId.current} rendering not found state`);
    return (
      <MainLayout pageTitle="Animal Not Found">
        <AnimalNotFound id={id} onBack={handleBack} />
      </MainLayout>
    );
  }

  console.log(`[DEBUG-Render] AnimalRecord ${componentId.current} rendering main content`);
  
  // Main render - use stable references to prevent unnecessary re-renders
  return (
    <MainLayout pageTitle={`${animalData.name} - Animal Record`}>
      <div className="max-w-[1200px] mx-auto py-6 animate-in fade-in-50 duration-300">
        <AnimalRecordHeader animalName={animalData.name} onBack={handleBack} />
        
        {animalWithWeightHistory && (
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
        )}

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
