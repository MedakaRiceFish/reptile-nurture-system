
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Thermometer, Droplet, Sun, HardDrive, Wrench, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface EnvironmentTabContentProps {
  type?: string;
  enclosureId?: string;
  enclosure?: any;
  getTemperatureColor?: (temp: number) => string;
  getHumidityColor?: (hum: number) => string;
}

export const EnvironmentTabContent: React.FC<EnvironmentTabContentProps> = ({
  type,
  enclosure,
  enclosureId,
  getTemperatureColor,
  getHumidityColor
}) => {
  // Sample hardware data for demonstration
  const hardwareItems = [
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
  ];

  // For components that aren't fully implemented yet, return simple placeholders
  if (type === "temperature") {
    return (
      <TabsContent value="temperature">
        <Card>
          <CardHeader>
            <CardTitle>Temperature History</CardTitle>
            <CardDescription>Temperature data over time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-12">
              Temperature history data will be available soon.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  if (type === "humidity") {
    return (
      <TabsContent value="humidity">
        <Card>
          <CardHeader>
            <CardTitle>Humidity History</CardTitle>
            <CardDescription>Humidity data over time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-12">
              Humidity history data will be available soon.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  if (type === "hardware") {
    return (
      <TabsContent value="hardware">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Hardware Management</CardTitle>
              <CardDescription>Track and maintain devices in this enclosure</CardDescription>
            </div>
            <Button className="bg-reptile-500 hover:bg-reptile-600">
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
                        <Button variant="ghost" size="sm">
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
        </Card>
      </TabsContent>
    );
  }

  // Default case
  return (
    <TabsContent value={type || "overview"}>
      <Card>
        <CardHeader>
          <CardTitle>Environment Data</CardTitle>
          <CardDescription>
            Data for this tab will be available soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-12">
            This feature is under development.
          </p>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
