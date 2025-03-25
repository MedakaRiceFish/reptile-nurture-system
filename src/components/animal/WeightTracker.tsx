
import React, { useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Weight } from "lucide-react";
import { AnimalWeightChart } from "@/components/ui/dashboard/AnimalWeightChart";
import { WeightHistoryList } from "@/components/ui/dashboard/WeightHistoryList";

interface WeightRecord {
  date: string;
  weight: number;
  id?: string;
}

interface WeightTrackerProps {
  animal: any;
  onAddWeightClick: () => void;
  onDeleteWeight?: (id: string) => void;
}

export const WeightTracker: React.FC<WeightTrackerProps> = ({
  animal,
  onAddWeightClick,
  onDeleteWeight
}) => {
  console.log("WeightTracker animal:", animal); // Debug log
  console.log("Weight history array:", animal.weightHistory); // Debug log
  
  const weightStats = useMemo(() => {
    // Initialize with default values
    const defaultStats = {
      currentWeight: animal.weight || 0,
      maxWeight: animal.weight || 0,
      percentChange: 0
    };
    
    // If no weight history, use the current animal weight as both current and max
    if (!animal.weightHistory || animal.weightHistory.length === 0) {
      console.log("No weight history found, using animal.weight:", animal.weight); 
      return defaultStats;
    }

    console.log("Weight history found:", animal.weightHistory.length, "records"); 
    
    // Sort by date (newest first) to get current weight
    const sortedWeights = [...animal.weightHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const currentWeight = sortedWeights[0].weight;
    
    // Find maximum weight
    const maxWeight = Math.max(...animal.weightHistory.map((record: WeightRecord) => record.weight));
    
    // Calculate percentage change from the previous weight
    let percentChange = 0;
    if (sortedWeights.length > 1) {
      const previousWeight = sortedWeights[1].weight;
      percentChange = previousWeight > 0 
        ? ((currentWeight - previousWeight) / previousWeight) * 100
        : 0;
    }
    
    return {
      currentWeight,
      maxWeight,
      percentChange
    };
  }, [animal.weightHistory, animal.weight]);

  // Force re-render when weight history changes
  useEffect(() => {
    console.log("Weight history changed, recalculating stats");
  }, [animal.weightHistory]);

  // Determine color based on percentage change
  const getPercentChangeColor = (percentChange: number) => {
    if (percentChange > 0) return 'text-green-500';
    if (percentChange < 0 && percentChange >= -3) return 'text-yellow-500';
    if (percentChange < -3) return 'text-red-500';
    return '';
  };

  // Check if there's weight history AND it has at least one record
  const hasWeightHistory = animal.weightHistory && animal.weightHistory.length > 0;

  console.log("Has weight history:", hasWeightHistory);
  console.log("Weight stats:", weightStats);

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
            <div className="text-sm text-muted-foreground mb-1">Change Since Last</div>
            <div className={`text-2xl font-bold ${getPercentChangeColor(weightStats.percentChange)}`}>
              {weightStats.percentChange > 0 ? '+' : ''}{weightStats.percentChange.toFixed(1)}%
            </div>
          </div>
        </div>

        {!hasWeightHistory ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No weight history available.</p>
            <p className="mt-2">Add a weight record to start tracking.</p>
          </div>
        ) : (
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            <TabsContent value="chart" className="pt-2">
              <AnimalWeightChart weightHistory={animal.weightHistory} />
            </TabsContent>
            <TabsContent value="list">
              <WeightHistoryList 
                weightHistory={animal.weightHistory} 
                onDeleteWeight={onDeleteWeight} 
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
