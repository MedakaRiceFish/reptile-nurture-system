
import React from "react";
import { 
  Thermometer, 
  Droplet
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnvironmentCardProps {
  enclosureId: number;
  enclosureName: string;
  temperature: number;
  humidity: number;
  light: number;
  pressure: number;
  image?: string;
  className?: string;
  onUpdateValues?: (id: number, values: { temperature: number; humidity: number }) => void;
}

export function EnvironmentCard({
  enclosureId,
  enclosureName,
  temperature,
  humidity,
  light,
  pressure,
  image,
  className,
  onUpdateValues
}: EnvironmentCardProps) {
  const getTemperatureColor = (temp: number) => {
    if (temp > 90) return "text-red-500";
    if (temp < 70) return "text-blue-500";
    return "text-reptile-500";
  };

  const getHumidityColor = (hum: number) => {
    if (hum > 80) return "text-blue-500";
    if (hum < 40) return "text-amber-500";
    return "text-reptile-500";
  };

  return (
    <div className={cn("enclosure-card overflow-hidden rounded-lg border bg-card shadow-sm", className)}>
      {image && (
        <div className="h-40 overflow-hidden">
          <img 
            src={image} 
            alt={enclosureName} 
            className="w-full h-full object-cover" 
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{enclosureName}</h3>
          <span className="text-xs px-2 py-0.5 bg-reptile-100 text-reptile-800 rounded-full">
            Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
            <Thermometer className="h-5 w-5 mb-1 text-muted-foreground" />
            <span className={cn("sensor-value", getTemperatureColor(temperature))}>
              {temperature}°F
            </span>
            <span className="sensor-label">Temperature</span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
            <Droplet className="h-5 w-5 mb-1 text-muted-foreground" />
            <span className={cn("sensor-value", getHumidityColor(humidity))}>
              {humidity}%
            </span>
            <span className="sensor-label">Humidity</span>
          </div>
        </div>

        <div className="mt-4 flex justify-end items-center">
          <span className="text-xs text-reptile-600 hover:text-reptile-700 font-medium">
            View Details
          </span>
        </div>
      </div>
    </div>
  );
}
