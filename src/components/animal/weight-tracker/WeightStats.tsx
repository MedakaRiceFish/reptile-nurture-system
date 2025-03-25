
import React, { useMemo, useCallback } from "react";
import { WeightRecord } from "@/hooks/animal-record/types";

interface WeightStatsProps {
  weightHistory: WeightRecord[];
  currentWeight: number;
}

// Calculates weight statistics from weight history
const WeightStats = ({ weightHistory, currentWeight }: WeightStatsProps) => {
  // Calculate stats from weight history
  const weightStats = useMemo(() => {
    const defaultStats = {
      currentWeight,
      maxWeight: currentWeight || 0,
      percentChange: 0,
      maxPercentChange: 0
    };
    
    if (!weightHistory || weightHistory.length === 0) {
      return defaultStats;
    }
    
    const sortedWeights = [...weightHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const latestWeight = sortedWeights[0].weight;
    
    const maxWeight = Math.max(...weightHistory.map((record) => record.weight));
    
    let percentChange = 0;
    if (sortedWeights.length > 1) {
      const previousWeight = sortedWeights[1].weight;
      percentChange = previousWeight > 0 
        ? ((latestWeight - previousWeight) / previousWeight) * 100
        : 0;
    }
    
    // Calculate percentage difference between current and max weight
    const maxPercentChange = maxWeight > 0 && maxWeight !== latestWeight
      ? ((latestWeight - maxWeight) / maxWeight) * 100
      : 0;
    
    return {
      currentWeight: latestWeight,
      maxWeight,
      percentChange,
      maxPercentChange
    };
  }, [weightHistory, currentWeight]);

  // Get color based on percent change
  const getPercentChangeColor = useCallback((percentChange: number) => {
    if (percentChange > 0) return 'text-green-500';
    if (percentChange < 0 && percentChange >= -3) return 'text-yellow-500';
    if (percentChange < -3) return 'text-red-500';
    return '';
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4 mb-6 mt-2">
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

      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="text-sm text-muted-foreground mb-1">From Max Weight</div>
        <div className={`text-2xl font-bold ${getPercentChangeColor(weightStats.maxPercentChange)}`}>
          {weightStats.maxPercentChange > 0 ? '+' : ''}{weightStats.maxPercentChange.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export { WeightStats };
