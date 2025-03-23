
import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Thermometer, Droplet, Sun, Wind, AlertTriangle, Camera } from "lucide-react";
import { format } from "date-fns";

interface EnvironmentImageCardProps {
  enclosure: any;
  imagePreview: string | null;
  imageError: boolean;
  getPlaceholderImage: () => string;
  handlePhotoButtonClick: () => void;
  handleImageError: () => void;
  getTemperatureColor: (temp: number) => string;
  getHumidityColor: (hum: number) => string;
}

export const EnvironmentImageCard: React.FC<EnvironmentImageCardProps> = ({
  enclosure,
  imagePreview,
  imageError,
  getPlaceholderImage,
  handlePhotoButtonClick,
  handleImageError,
  getTemperatureColor,
  getHumidityColor
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const localHandlePhotoButtonClick = () => {
    fileInputRef.current?.click();
    handlePhotoButtonClick();
  };
  
  return (
    <Card>
      <div className="relative">
        <img 
          src={imageError ? getPlaceholderImage() : (imagePreview || enclosure.image)} 
          alt={enclosure.name} 
          className="w-full h-[300px] object-cover rounded-t-lg"
          onError={handleImageError}
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button size="sm" variant="secondary" className="h-8" onClick={localHandlePhotoButtonClick}>
            <Camera className="w-4 h-4 mr-1" />
            Upload Photo
          </Button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handlePhotoButtonClick()}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <EnvironmentMetricCard 
            icon={<Thermometer className="h-6 w-6 mb-2 text-muted-foreground" />}
            value={`${enclosure.temperature}°F`}
            label="Temperature"
            valueClassName={getTemperatureColor(enclosure.temperature)}
          />
          
          <EnvironmentMetricCard 
            icon={<Droplet className="h-6 w-6 mb-2 text-muted-foreground" />}
            value={`${enclosure.humidity}%`}
            label="Humidity"
            valueClassName={getHumidityColor(enclosure.humidity)}
          />
          
          <EnvironmentMetricCard 
            icon={<Sun className="h-6 w-6 mb-2 text-muted-foreground" />}
            value="12/12"
            label="Light Cycle"
          />
          
          <EnvironmentMetricCard 
            icon={<Wind className="h-6 w-6 mb-2 text-muted-foreground" />}
            value="Low"
            label="Ventilation"
          />
        </div>
        
        <div className="text-sm text-muted-foreground">
          Last reading: {format(enclosure.lastReading, "PPp")}
          {enclosure.readingStatus !== "online" && (
            <span className="flex items-center mt-2 text-amber-500">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {enclosure.readingStatus === "warning" 
                ? "Sensor readings delayed. Check connection." 
                : "Sensors offline. Maintenance required."}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface EnvironmentMetricCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  valueClassName?: string;
}

const EnvironmentMetricCard: React.FC<EnvironmentMetricCardProps> = ({
  icon,
  value,
  label,
  valueClassName = ""
}) => {
  return (
    <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
      {icon}
      <span className={`text-2xl font-semibold ${valueClassName}`}>
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
};
