
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { TemperatureTabContent } from "./tabs/TemperatureTabContent";
import { HumidityTabContent } from "./tabs/HumidityTabContent";
import { HardwareManagement } from "./tabs/HardwareManagement";
import { PlaceholderTabContent } from "./tabs/PlaceholderTabContent";

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
  if (type === "temperature") {
    return (
      <TabsContent value="temperature">
        <TemperatureTabContent enclosureId={enclosureId} />
      </TabsContent>
    );
  }

  if (type === "humidity") {
    return (
      <TabsContent value="humidity">
        <HumidityTabContent enclosureId={enclosureId} />
      </TabsContent>
    );
  }

  if (type === "hardware") {
    return (
      <TabsContent value="hardware">
        <HardwareManagement enclosureId={enclosureId} />
      </TabsContent>
    );
  }

  // Default case
  return (
    <TabsContent value={type || "overview"}>
      <PlaceholderTabContent />
    </TabsContent>
  );
};
