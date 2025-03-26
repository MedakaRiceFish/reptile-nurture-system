
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchSensors, mapSensorToEnclosure } from "@/services/sensorPushService";
import { SensorPushSensor } from "@/types/sensorpush";
import { WifiIcon } from "lucide-react";
import { toast } from "sonner";

interface SensorMappingDialogProps {
  enclosureId: string;
  enclosureName: string;
  trigger?: React.ReactNode;
}

export function SensorMappingDialog({ 
  enclosureId, 
  enclosureName, 
  trigger 
}: SensorMappingDialogProps) {
  const [open, setOpen] = useState(false);
  const [sensors, setSensors] = useState<SensorPushSensor[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadSensors();
    }
  }, [open]);

  const loadSensors = async () => {
    setIsLoading(true);
    const sensorList = await fetchSensors();
    if (sensorList) {
      setSensors(sensorList);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!selectedSensorId) {
      toast.error("Please select a sensor");
      return;
    }

    setIsLoading(true);
    const success = await mapSensorToEnclosure(selectedSensorId, enclosureId);
    setIsLoading(false);
    
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <WifiIcon className="h-4 w-4" />
            Connect Sensor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Sensor to {enclosureName}</DialogTitle>
          <DialogDescription>
            Select a SensorPush sensor to connect to this enclosure. The temperature and humidity readings will
            automatically update in real-time.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sensor</label>
              {sensors.length === 0 && !isLoading ? (
                <div className="text-sm text-muted-foreground">
                  No sensors found. Make sure your SensorPush account is connected and your sensors are active.
                </div>
              ) : (
                <Select value={selectedSensorId} onValueChange={setSelectedSensorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sensor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sensors.map((sensor) => (
                      <SelectItem key={sensor.id} value={sensor.id}>
                        {sensor.name} {sensor.active ? "(Active)" : "(Inactive)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading || !selectedSensorId}>
            {isLoading ? "Saving..." : "Connect Sensor"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
