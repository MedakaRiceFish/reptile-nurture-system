
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Check, WifiIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { deviceTypes } from "./DeviceTypes";
import { deviceFormSchema, DeviceFormValues } from "./DeviceFormSchema";
import { 
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { fetchSensors, mapSensorToEnclosure } from "@/services/sensorPush";
import { toast } from "sonner";
import { SensorPushSensor } from "@/types/sensorpush";

interface DeviceDialogContentProps {
  onSave: (data: DeviceFormValues) => void;
  enclosureId: string;
  enclosureName: string;
}

export const DeviceDialogContent: React.FC<DeviceDialogContentProps> = ({ 
  onSave, 
  enclosureId, 
  enclosureName 
}) => {
  // Set default dates for the form
  const today = new Date();
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(today.getMonth() + 6);

  // State for sensor selection
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("");
  const [isConnectingSensor, setIsConnectingSensor] = useState(false);
  const [sensors, setSensors] = useState<SensorPushSensor[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>("");
  const [isLoadingSensors, setIsLoadingSensors] = useState(false);

  // Initialize the form
  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: {
      name: "",
      type: "",
      lastMaintenance: today,
      nextMaintenance: sixMonthsLater,
    },
  });

  // Watch for changes in the device type
  const deviceType = form.watch("type");
  
  useEffect(() => {
    setSelectedDeviceType(deviceType);
  }, [deviceType]);

  // Load sensors when connecting
  const loadSensors = async () => {
    setIsLoadingSensors(true);
    const sensorList = await fetchSensors();
    if (sensorList) {
      setSensors(sensorList);
    }
    setIsLoadingSensors(false);
  };

  // Handle sensor connection
  const handleConnectSensor = async () => {
    setIsConnectingSensor(true);
    loadSensors();
  };

  // Handle sensor mapping
  const handleSensorMapping = async () => {
    if (!selectedSensorId) {
      toast.error("Please select a sensor");
      return;
    }

    setIsLoadingSensors(true);
    const success = await mapSensorToEnclosure(selectedSensorId, enclosureId);
    setIsLoadingSensors(false);
    
    if (success) {
      toast.success(`Sensor successfully mapped to ${enclosureName}`);
      setIsConnectingSensor(false);
      
      // Update the form with the selected sensor's name
      const selectedSensor = sensors.find(s => s.id === selectedSensorId);
      if (selectedSensor) {
        form.setValue("name", selectedSensor.name);
      }
    }
  };

  // Handle form submission
  const onSubmit = (data: DeviceFormValues) => {
    onSave(data);
    form.reset();
    setSelectedDeviceType("");
    setIsConnectingSensor(false);
    setSelectedSensorId("");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Name</FormLabel>
              <FormControl>
                <Input placeholder="Temperature Sensor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Type</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedDeviceType(value);
                  setIsConnectingSensor(false);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a device type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {deviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {selectedDeviceType === "Sensor" && !isConnectingSensor && (
          <Button 
            type="button" 
            variant="outline"
            className="w-full"
            onClick={handleConnectSensor}
          >
            <WifiIcon className="h-4 w-4 mr-2" />
            Connect SensorPush Sensor
          </Button>
        )}

        {selectedDeviceType === "Sensor" && isConnectingSensor && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Select SensorPush Sensor</h4>
            
            {isLoadingSensors ? (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">Loading sensors...</p>
              </div>
            ) : sensors.length === 0 ? (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">No sensors found. Make sure your SensorPush account is connected.</p>
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
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsConnectingSensor(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                className="flex-1"
                disabled={!selectedSensorId || isLoadingSensors}
                onClick={handleSensorMapping}
              >
                Map Sensor
              </Button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="lastMaintenance"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Last Maintenance</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="nextMaintenance"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Next Maintenance</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" className="bg-reptile-500 hover:bg-reptile-600">
            <Check className="h-4 w-4 mr-2" /> Add Device
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
