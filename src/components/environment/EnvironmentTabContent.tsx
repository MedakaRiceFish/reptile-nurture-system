
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Thermometer, Droplet, Sun, Monitor, AlertTriangle, Lock } from "lucide-react";

interface EnvironmentTabContentProps {
  type?: string;           // Make this optional since it's passed but not used in component interface
  enclosureId?: string;    // Add this prop to match what's passed
  enclosure?: any;
  getTemperatureColor?: (temp: number) => string;
  getHumidityColor?: (hum: number) => string;
}

export const EnvironmentTabContent: React.FC<EnvironmentTabContentProps> = ({
  type,
  enclosure,
  getTemperatureColor,
  getHumidityColor
}) => {
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

  if (type === "maintenance") {
    return (
      <TabsContent value="maintenance">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
            <CardDescription>Upcoming and past maintenance activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-12">
              Maintenance schedule information will be available soon.
            </p>
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
