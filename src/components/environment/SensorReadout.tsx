
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchSensorSamples } from "@/services/sensorPush/sensorPushSensorService";
import { getEnclosureSensor } from "@/services/sensorPush/sensorPushMappingService";
import { SensorPushSample } from "@/types/sensorpush";
import { RefreshCwIcon, ThermometerIcon, DropletIcon } from "lucide-react";
import { toast } from "sonner";
import { SensorMappingDialog } from "./SensorMappingDialog";

interface SensorReadoutProps {
  enclosureId: string;
  enclosureName: string;
}

export function SensorReadout({ enclosureId, enclosureName }: SensorReadoutProps) {
  const [latestReading, setLatestReading] = useState<SensorPushSample | null>(null);
  const [sensorId, setSensorId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSensorData();
  }, [enclosureId]);

  const loadSensorData = async () => {
    setIsLoading(true);
    
    try {
      // Get the sensor mapped to this enclosure
      const sensor = await getEnclosureSensor(enclosureId);
      setSensorId(sensor);
      
      if (sensor) {
        // Fetch the latest readings
        const samples = await fetchSensorSamples(sensor, 1);
        if (samples && samples.length > 0) {
          setLatestReading(samples[0]);
          setLastUpdated(new Date());
        }
      }
    } catch (error) {
      console.error("Failed to load sensor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSensorData();
    toast.info("Refreshing sensor data...");
  };

  const formatTemperature = (temp?: number) => {
    if (temp === undefined) return "N/A";
    // Convert from C to F
    const fahrenheit = (temp * 9/5) + 32;
    return `${fahrenheit.toFixed(1)}°F`;
  };

  const formatHumidity = (humidity?: number) => {
    if (humidity === undefined) return "N/A";
    return `${humidity.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Live Sensor Data</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isLoading || !sensorId}
          >
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
          {!sensorId && (
            <SensorMappingDialog 
              enclosureId={enclosureId} 
              enclosureName={enclosureName} 
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!sensorId ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No sensor connected to this enclosure.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect a SensorPush sensor to get real-time readings.
            </p>
          </div>
        ) : !latestReading ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No readings available.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sensor is connected but no data has been received.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                <ThermometerIcon className="h-6 w-6 mb-2 text-reptile-500" />
                <span className="text-2xl font-semibold">
                  {formatTemperature(latestReading.temperature)}
                </span>
                <span className="text-sm text-muted-foreground">Temperature</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                <DropletIcon className="h-6 w-6 mb-2 text-blue-500" />
                <span className="text-2xl font-semibold">
                  {formatHumidity(latestReading.humidity)}
                </span>
                <span className="text-sm text-muted-foreground">Humidity</span>
              </div>
            </div>
            
            {lastUpdated && (
              <div className="text-xs text-center text-muted-foreground">
                Last updated: {lastUpdated.toLocaleString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
