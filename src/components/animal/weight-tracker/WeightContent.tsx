
import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimalWeightChart } from "@/components/ui/dashboard/AnimalWeightChart";
import { WeightHistoryList } from "@/components/ui/dashboard/WeightHistoryList";
import { WeightRecord } from "@/hooks/animal-record/types";

interface WeightContentProps {
  weightHistory: WeightRecord[];
  containerKey: string;
  onDeleteWeight?: (id: string) => void;
}

const WeightContent = ({ weightHistory, containerKey, onDeleteWeight }: WeightContentProps) => {
  const hasWeightHistory = weightHistory.length > 0;
  
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedTab = sessionStorage.getItem('weightTrackerActiveTab');
      return savedTab || "chart";
    } catch (e) {
      return "chart";
    }
  });
  
  useEffect(() => {
    try {
      sessionStorage.setItem('weightTrackerActiveTab', activeTab);
    } catch (e) {
      console.error("Error saving tab state:", e);
    }
  }, [activeTab]);

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

  return content;
};

export { WeightContent };
