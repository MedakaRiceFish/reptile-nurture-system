
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Weight } from "lucide-react";
import { AnimalWeightChart } from "@/components/ui/dashboard/AnimalWeightChart";
import { WeightHistoryList } from "@/components/ui/dashboard/WeightHistoryList";

interface WeightTrackerProps {
  animal: any;
  onAddWeightClick: () => void;
}

export const WeightTracker: React.FC<WeightTrackerProps> = ({
  animal,
  onAddWeightClick,
}) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle>Weight Records</CardTitle>
          <Button size="sm" onClick={onAddWeightClick}>
            <Weight className="w-4 h-4 mr-2" />
            Add Weight
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="pt-2">
            <AnimalWeightChart weightHistory={animal.weightHistory} />
          </TabsContent>
          <TabsContent value="list">
            <WeightHistoryList weightHistory={animal.weightHistory} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
