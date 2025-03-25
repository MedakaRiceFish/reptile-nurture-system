
import React, { useState } from "react";
import { useEnclosure } from "@/hooks/useEnclosure";
import { EnvironmentHeader } from "@/components/environment/EnvironmentHeader";
import { EnvironmentContent } from "@/components/environment/EnvironmentContent";
import { EnvironmentNotFound } from "@/components/environment/EnvironmentNotFound";
import { EditEnvironmentDetailsDialog } from "@/components/ui/dashboard/EditEnvironmentDetailsDialog";

export const EnvironmentContainer = () => {
  const {
    enclosure,
    isLoading,
    imagePreview,
    imageError,
    isEditDialogOpen,
    fileInputRef,
    setIsEditDialogOpen,
    getPlaceholderImage,
    handlePhotoButtonClick,
    handleImageError,
    getTemperatureColor,
    getHumidityColor,
    getStatusColor,
    handleFileChange,
    handleDetailsUpdate
  } = useEnclosure();

  if (!enclosure) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="animate-pulse">
          <div className="h-12 bg-muted rounded-lg mb-4 w-1/2"></div>
          <div className="h-80 bg-muted rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-60 bg-muted rounded-lg"></div>
            <div className="h-60 bg-muted rounded-lg"></div>
            <div className="h-60 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (enclosure.id === "not-found") {
    return <EnvironmentNotFound id={enclosure.id} />;
  }

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-up">
      <EnvironmentHeader
        enclosureName={enclosure.name}
        enclosureId={enclosure.id}
        temperature={enclosure.temperature}
        humidity={enclosure.humidity}
      />

      <EnvironmentContent 
        enclosure={enclosure}
        imagePreview={imagePreview}
        imageError={imageError}
        fileInputRef={fileInputRef}
        getPlaceholderImage={getPlaceholderImage}
        handlePhotoButtonClick={handlePhotoButtonClick}
        handleImageError={handleImageError}
        getTemperatureColor={getTemperatureColor}
        getHumidityColor={getHumidityColor}
        getStatusColor={getStatusColor}
        onFileChange={handleFileChange}
        onEditClick={() => setIsEditDialogOpen(true)}
      />

      <EditEnvironmentDetailsDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        enclosure={enclosure}
        onSave={handleDetailsUpdate}
      />
    </div>
  );
};
