
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnvironmentImageCard } from "./EnvironmentImageCard";
import { EnvironmentDetailsCard } from "./EnvironmentDetailsCard";
import { InhabitantsCard } from "./InhabitantsCard";
import { EnvironmentTabContent } from "./EnvironmentTabContent";

interface EnvironmentContentProps {
  enclosure: any;
  imagePreview: string | null;
  imageError: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  getPlaceholderImage: () => string;
  handlePhotoButtonClick: () => void;
  handleImageError: () => void;
  getTemperatureColor: (temp: number) => string;
  getHumidityColor: (hum: number) => string;
  getStatusColor: (status: string) => string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditClick: () => void;
}

export const EnvironmentContent: React.FC<EnvironmentContentProps> = ({
  enclosure,
  imagePreview,
  imageError,
  fileInputRef,
  getPlaceholderImage,
  handlePhotoButtonClick,
  handleImageError,
  getTemperatureColor,
  getHumidityColor,
  getStatusColor,
  onFileChange,
  onEditClick
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <EnvironmentImageCard 
            enclosure={enclosure}
            imagePreview={imagePreview}
            imageError={imageError}
            getPlaceholderImage={getPlaceholderImage}
            handlePhotoButtonClick={handlePhotoButtonClick}
            handleImageError={handleImageError}
            getTemperatureColor={getTemperatureColor}
            getHumidityColor={getHumidityColor}
            onFileChange={onFileChange}
            fileInputRef={fileInputRef}
          />
        </div>

        <div className="md:col-span-1 grid grid-rows-2 gap-6 h-full">
          <EnvironmentDetailsCard 
            enclosure={enclosure}
            getStatusColor={getStatusColor}
            onEditClick={onEditClick}
          />
          
          <InhabitantsCard enclosureId={enclosure.id} />
        </div>
      </div>

      <Tabs defaultValue="temperature" className="mb-8">
        <TabsList>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="humidity">Humidity</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        <TabsContent value="temperature">
          <EnvironmentTabContent type="temperature" enclosureId={enclosure.id} />
        </TabsContent>
        <TabsContent value="humidity">
          <EnvironmentTabContent type="humidity" enclosureId={enclosure.id} />
        </TabsContent>
        <TabsContent value="maintenance">
          <EnvironmentTabContent type="maintenance" enclosureId={enclosure.id} />
        </TabsContent>
      </Tabs>
    </>
  );
};
