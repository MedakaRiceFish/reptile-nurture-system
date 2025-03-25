import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Thermometer, Droplet, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnclosureValueEditorProps {
  enclosureId: string | number;
  enclosureName: string;
  currentTemperature: number;
  currentHumidity: number;
  onUpdate?: (id: string | number, values: { temperature: number; humidity: number }) => void;
}

export function EnclosureValueEditor({
  enclosureId,
  enclosureName,
  currentTemperature,
  currentHumidity,
  onUpdate
}: EnclosureValueEditorProps) {
  const [open, setOpen] = useState(false);
  const [temperature, setTemperature] = useState(currentTemperature);
  const [humidity, setHumidity] = useState(currentHumidity);
  const { toast } = useToast();

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(enclosureId, { temperature, humidity });
    }
    
    toast({
      title: "Environment updated",
      description: `${enclosureName} temperature and humidity have been updated.`,
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Settings className="h-3.5 w-3.5 mr-1" />
          Set Values
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Environment Values</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-amber-500" />
                <Label htmlFor="temperature">Temperature</Label>
              </div>
              <div className="font-medium">{temperature}°F</div>
            </div>
            <Slider
              id="temperature"
              min={65}
              max={100}
              step={1}
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
              className="w-full"
            />
            <Input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              min={65}
              max={100}
              className="col-span-2 h-9"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-blue-500" />
                <Label htmlFor="humidity">Humidity</Label>
              </div>
              <div className="font-medium">{humidity}%</div>
            </div>
            <Slider
              id="humidity"
              min={20}
              max={90}
              step={1}
              value={[humidity]}
              onValueChange={(value) => setHumidity(value[0])}
              className="w-full"
            />
            <Input
              type="number"
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
              min={20}
              max={90}
              className="col-span-2 h-9"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
