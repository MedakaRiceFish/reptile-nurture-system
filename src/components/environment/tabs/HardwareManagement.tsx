
import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HardDrive, Wrench, PlusCircle } from "lucide-react";
import { AddDeviceDialog } from "../device/AddDeviceDialog";
import { toast } from "sonner";
import { HardwareItem } from "@/types/hardware";

interface HardwareManagementProps {
  enclosureId?: string;
}

export const HardwareManagement: React.FC<HardwareManagementProps> = ({ enclosureId }) => {
  // State for hardware items
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([
    {
      id: 1,
      name: "Temperature Sensor",
      type: "Sensor",
      lastMaintenance: new Date(2023, 9, 15),
      nextMaintenance: new Date(2024, 3, 15),
    },
    {
      id: 2,
      name: "Humidity Controller",
      type: "Controller",
      lastMaintenance: new Date(2023, 11, 5),
      nextMaintenance: new Date(2024, 5, 5),
    },
    {
      id: 3,
      name: "UV Light",
      type: "Light",
      lastMaintenance: new Date(2024, 0, 20),
      nextMaintenance: new Date(2024, 6, 20),
    }
  ]);

  // State for add device dialog
  const [isAddDeviceDialogOpen, setIsAddDeviceDialogOpen] = useState(false);

  // Function to handle adding a new device
  const handleAddDevice = (data: any) => {
    const newDevice: HardwareItem = {
      id: Date.now(), // Simple ID generation
      name: data.name,
      type: data.type,
      lastMaintenance: data.lastMaintenance,
      nextMaintenance: data.nextMaintenance,
    };

    setHardwareItems([...hardwareItems, newDevice]);
    setIsAddDeviceDialogOpen(false);
    toast.success(`${data.name} added successfully`);
  };

  // Function to handle device maintenance
  const handleMaintenance = (id: number) => {
    const today = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(today.getMonth() + 6);

    setHardwareItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { 
              ...item, 
              lastMaintenance: today,
              nextMaintenance: sixMonthsLater 
            } 
          : item
      )
    );
    
    toast.success("Maintenance recorded");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Hardware Management</CardTitle>
          <CardDescription>Track and maintain devices in this enclosure</CardDescription>
        </div>
        <Button 
          className="bg-reptile-500 hover:bg-reptile-600"
          onClick={() => setIsAddDeviceDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add Device
        </Button>
      </CardHeader>
      <CardContent>
        {hardwareItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead>Next Maintenance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hardwareItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium flex items-center">
                    <HardDrive className="h-4 w-4 mr-2 text-reptile-500" />
                    {item.name}
                  </TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{format(item.lastMaintenance, "MMM d, yyyy")}</TableCell>
                  <TableCell>{format(item.nextMaintenance, "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleMaintenance(item.id)}
                    >
                      <Wrench className="h-4 w-4 mr-1" /> Maintain
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <HardDrive className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No hardware devices added yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Add a device to start tracking.</p>
          </div>
        )}
      </CardContent>

      {/* Add Device Dialog */}
      <AddDeviceDialog 
        open={isAddDeviceDialogOpen}
        onOpenChange={setIsAddDeviceDialogOpen}
        onSave={handleAddDevice}
      />
    </Card>
  );
};
