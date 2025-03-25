
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface HumidityTabContentProps {
  enclosureId?: string;
}

export const HumidityTabContent: React.FC<HumidityTabContentProps> = ({ enclosureId }) => {
  return (
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
  );
};
