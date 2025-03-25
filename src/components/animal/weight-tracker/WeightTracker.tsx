
import React, { useMemo, useCallback, memo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Weight } from "lucide-react";
import { WeightStats } from "./WeightStats";
import { WeightContent } from "./WeightContent";
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

const WeightTrackerComponent = ({
  animal,
  onAddWeightClick,
  onDeleteWeight
}: WeightTrackerProps) => {
  const instanceId = useRef(Math.random().toString(36).substring(7));
  
  // Debugging logs for component lifecycle
  useEffect(() => {
    console.log(`[DEBUG-Render] WeightTracker mounted with ID: ${instanceId.current}`);
    return () => console.log(`[DEBUG-Render] WeightTracker with ID ${instanceId.current} unmounting`);
  }, []);
  
  // Generate a stable container key based on animal ID
  const containerKey = useMemo(() => {
    const key = `weight-tracker-${animal.id || 'new'}`;
    console.log(`[DEBUG-Render] WeightTracker ${instanceId.current} generated containerKey: ${key}`);
    return key;
  }, [animal.id]);

  // Access weight history from animal props with proper fallback
  const weightHistory = useMemo(() => {
    const history = animal.weightHistory || [];
    console.log(`[DEBUG-Render] WeightTracker ${instanceId.current} memoized weightHistory:`, { 
      count: history.length,
      recordIds: history.slice(0, 2).map(r => r.id).join(', ') + (history.length > 2 ? '...' : '')
    });
    return history;
  }, [animal.weightHistory]);

  // Wrapped delete handler for consistent logging
  const handleDeleteWithLogging = useCallback((id: string) => {
    console.log(`[DEBUG-Action] Delete weight clicked in WeightTracker ${instanceId.current} for record: ${id}`);
    onDeleteWeight?.(id);
  }, [onDeleteWeight]);

  console.log(`[DEBUG-Render] WeightTracker ${instanceId.current} rendering`);
  
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
        <WeightStats 
          weightHistory={weightHistory} 
          currentWeight={animal.weight || 0} 
        />
        
        <WeightContent 
          weightHistory={weightHistory}
          containerKey={containerKey}
          onDeleteWeight={handleDeleteWithLogging}
        />
      </CardContent>
    </Card>
  );
};

// Create memoized version of the component
const WeightTracker = memo(WeightTrackerComponent);

// Add logging wrapper for development
const WithLogging = (props: WeightTrackerProps) => {
  const renderCount = useRef(0);
  console.log(`[DEBUG-Render] WeightTracker render count: ${++renderCount.current}`);
  return <WeightTracker {...props} />;
};

export { WithLogging as WeightTracker };
export default WithLogging;
