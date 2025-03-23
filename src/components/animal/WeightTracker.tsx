
import React, { useMemo } from "react";
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
  const weightStats = useMemo(() => {
    if (!animal.weightHistory || animal.weightHistory.length === 0) {
      return {
        currentWeight: 0,
        maxWeight: 0,
        percentDifference: 0
      };
    }

    // Sort by date (newest first) to get current weight
    const sortedWeights = [...animal.weightHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const currentWeight = sortedWeights[0].weight;
    
    // Find maximum weight
    const maxWeight = Math.max(...animal.weightHistory.map(record => record.weight));
    
    // Calculate percentage difference
    const percentDifference = maxWeight > 0 
      ? ((currentWeight - maxWeight) / maxWeight) * 100
      : 0;
    
    return {
      currentWeight,
      maxWeight,
      percentDifference
    };
  }, [animal.weightHistory]);

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
        {/* Weight stats summary */}
        <div className="grid grid-cols-3 gap-4 mb-6 mt-2">
          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-muted-foreground mb-1">Current Weight</div>
            <div className="text-2xl font-bold">{weightStats.currentWeight} g</div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-muted-foreground mb-1">Max Weight</div>
            <div className="text-2xl font-bold">{weightStats.maxWeight} g</div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-muted-foreground mb-1">From Max</div>
            <div className={`text-2xl font-bold ${weightStats.percentDifference < 0 ? 'text-red-500' : weightStats.percentDifference > 0 ? 'text-green-500' : ''}`}>
              {weightStats.percentDifference.toFixed(1)}%
            </div>
          </div>
        </div>

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
