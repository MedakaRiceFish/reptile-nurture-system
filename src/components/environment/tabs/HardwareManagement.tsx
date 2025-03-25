
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HardDrive, Wrench, PlusCircle } from "lucide-react";
import { AddDeviceDialog } from "../device/AddDeviceDialog";
import { toast } from "sonner";
import { HardwareItem } from "@/types/hardware";
import { useAuth } from "@/context/AuthContext";
import { fetchHardwareDevices, addHardwareDevice, updateDeviceMaintenance } from "@/services/hardwareService";
import { supabase } from "@/integrations/supabase/client";

interface HardwareManagementProps {
  enclosureId?: string;
}

export const HardwareManagement: React.FC<HardwareManagementProps> = ({ enclosureId }) => {
  // State for hardware items
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // State for add device dialog
  const [isAddDeviceDialogOpen, setIsAddDeviceDialogOpen] = useState(false);

  // Fetch hardware devices
  const fetchDevices = async () => {
    if (!enclosureId) return;
    
    setIsLoading(true);
    try {
      const devices = await fetchHardwareDevices(enclosureId);
      setHardwareItems(devices);
    } catch (error) {
      console.error("Failed to fetch hardware devices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    
    // Set up real-time subscription for hardware device changes
    if (enclosureId) {
      const channel = supabase
        .channel('hardware-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'hardware_devices',
          filter: `enclosure_id=eq.${enclosureId}`
        }, (payload) => {
          console.log('Hardware device change detected:', payload);
          fetchDevices(); // Refetch when changes are detected
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [enclosureId, user]);

  // Function to handle adding a new device
  const handleAddDevice = async (data: any) => {
    if (!enclosureId || !user) {
      toast.error("You need to be logged in to add devices");
      return;
    }
    
    try {
      const newDevice = {
        name: data.name,
        type: data.type,
        lastMaintenance: data.lastMaintenance,
        nextMaintenance: data.nextMaintenance,
        enclosureId: enclosureId
      };

      await addHardwareDevice(newDevice);
      setIsAddDeviceDialogOpen(false);
      toast.success(`${data.name} added successfully`);
      fetchDevices(); // Refresh list after adding
    } catch (error: any) {
      toast.error(`Failed to add device: ${error.message}`);
    }
  };

  // Function to handle device maintenance
  const handleMaintenance = async (id: string) => {
    try {
      const today = new Date();
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(today.getMonth() + 6);

      await updateDeviceMaintenance(id, today, sixMonthsLater);
      
      // Update the local state optimistically
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
    } catch (error: any) {
      toast.error(`Failed to update maintenance: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hardware Management</CardTitle>
          <CardDescription>Loading devices...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded-lg w-full"></div>
            <div className="h-20 bg-muted rounded-lg w-full"></div>
            <div className="h-20 bg-muted rounded-lg w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
