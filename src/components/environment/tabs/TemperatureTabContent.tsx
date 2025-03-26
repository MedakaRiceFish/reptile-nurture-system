
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SensorChart } from "@/components/ui/dashboard/SensorChart";

interface TemperatureTabContentProps {
  enclosureId?: string;
}

export const TemperatureTabContent: React.FC<TemperatureTabContentProps> = ({ enclosureId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature History</CardTitle>
        <CardDescription>Temperature data over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="readings">Readings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart">
            <div className="h-[400px]">
              <SensorChart />
            </div>
          </TabsContent>
          
          <TabsContent value="readings">
            <p className="text-center text-muted-foreground py-12">
              Detailed temperature readings will be available soon.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
