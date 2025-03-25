
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

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
        <p className="text-center text-muted-foreground py-12">
          Temperature history data will be available soon.
        </p>
      </CardContent>
    </Card>
  );
};
