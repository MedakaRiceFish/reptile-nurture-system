
import React, { useMemo, useEffect, useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Weight } from "lucide-react";
import { AnimalWeightChart } from "@/components/ui/dashboard/AnimalWeightChart";
import { WeightHistoryList } from "@/components/ui/dashboard/WeightHistoryList";
import { WeightRecord } from "@/hooks/animal-record/types";

interface WeightTrackerProps {
  animal: {
    id?: string;
    weight?: number;
    weightHistory?: WeightRecord[];
  };
  onAddWeightClick: () => void;
  onDeleteWeight?: (id: string) => void;
}

const WeightTracker = ({
  animal,
  onAddWeightClick,
  onDeleteWeight
}: WeightTrackerProps) => {
  // Use state to maintain tab selection with localStorage for persistence
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedTab = sessionStorage.getItem('weightTrackerActiveTab');
      return savedTab || "chart";
    } catch (e) {
      return "chart";
    }
  });
  
  // Save tab selection to sessionStorage when it changes
  useEffect(() => {
    try {
      sessionStorage.setItem('weightTrackerActiveTab', activeTab);
    } catch (e) {
      console.error("Error saving tab state:", e);
    }
  }, [activeTab]);
  
  // Extract the weight history or use an empty array (memoized)
  const weightHistory = useMemo(() => {
    return animal.weightHistory || [];
  }, [animal.weightHistory]);

  // Generate a stable key based on animal ID to force container remounting when animal changes
  const containerKey = useMemo(() => 
    `weight-tracker-${animal.id || 'new'}`, 
    [animal.id]
  );

  // Memoize weight stats calculation
  const weightStats = useMemo(() => {
    // Initialize with default values
    const defaultStats = {
      currentWeight: animal.weight || 0,
      maxWeight: animal.weight || 0,
      percentChange: 0
    };
    
    // If no weight history, use the current animal weight as both current and max
    if (!weightHistory || weightHistory.length === 0) {
      return defaultStats;
    }
    
    // Sort by date (newest first) to get current weight
    const sortedWeights = [...weightHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const currentWeight = sortedWeights[0].weight;
    
    // Find maximum weight
    const maxWeight = Math.max(...weightHistory.map((record: WeightRecord) => record.weight));
    
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
  }, [weightHistory, animal.weight]);

  // Determine color based on percentage change
  const getPercentChangeColor = useCallback((percentChange: number) => {
    if (percentChange > 0) return 'text-green-500';
    if (percentChange < 0 && percentChange >= -3) return 'text-yellow-500';
    if (percentChange < -3) return 'text-red-500';
    return '';
  }, []);

  // Check if there's weight history AND it has at least one record
  const hasWeightHistory = weightHistory.length > 0;

  // Memoized content based on whether there's weight history
  const content = useMemo(() => {
    if (!hasWeightHistory) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No weight history available.</p>
          <p className="mt-2">Add a weight record to start tracking.</p>
        </div>
      );
    }
    
    return (
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        defaultValue={activeTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        <TabsContent value="chart" className="pt-2">
          <AnimalWeightChart weightHistory={weightHistory} key={`chart-${containerKey}`} />
        </TabsContent>
        <TabsContent value="list">
          <WeightHistoryList 
            weightHistory={weightHistory}
            onDeleteWeight={onDeleteWeight}
            key={`list-${containerKey}`}
          />
        </TabsContent>
      </Tabs>
    );
  }, [activeTab, hasWeightHistory, weightHistory, containerKey, onDeleteWeight]);

  return (
    <Card className="lg:col-span-2" key={containerKey}>
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

        {content}
      </CardContent>
    </Card>
  );
};

export default memo(WeightTracker);
