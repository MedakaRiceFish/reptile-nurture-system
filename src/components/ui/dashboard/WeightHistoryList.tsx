
import React, { useMemo, memo, useCallback, useRef, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { WeightRecord } from "@/hooks/animal-record/types";

interface WeightHistoryListProps {
  weightHistory: WeightRecord[];
  onDeleteWeight?: (id: string) => void;
}

// Memoize the weight history row to prevent re-rendering all rows
const WeightHistoryRow = memo(({ 
  record, 
  prevWeight, 
  onDelete 
}: { 
  record: WeightRecord; 
  prevWeight?: number; 
  onDelete?: (id: string) => void;
}) => {
  const rowId = useRef(Math.random().toString(36).substring(7));
  
  useEffect(() => {
    console.log(`[DEBUG-Render] WeightHistoryRow ${rowId.current} mounted for record: ${record.id}`);
    return () => console.log(`[DEBUG-Render] WeightHistoryRow ${rowId.current} unmounting for record: ${record.id}`);
  }, [record.id]);
  
  // Calculate weight change
  const change = prevWeight ? record.weight - prevWeight : 0;
  
  // Format date
  let formattedDate;
  try {
    formattedDate = format(parseISO(record.date), "MMM d, yyyy");
  } catch (e) {
    formattedDate = record.date;
  }

  // Memoize the delete handler to prevent recreating it on every render
  const handleDelete = useCallback(() => {
    console.log(`[DEBUG-Action] Delete button clicked for record: ${record.id}`);
    if (record.id && onDelete) {
      onDelete(record.id);
    }
  }, [record.id, onDelete]);

  console.log(`[DEBUG-Render] WeightHistoryRow ${rowId.current} rendering for record: ${record.id}`);
  
  return (
    <TableRow>
      <TableCell>{formattedDate}</TableCell>
      <TableCell className="font-medium">{record.weight}</TableCell>
      <TableCell>
        {prevWeight && (
          <span className={`${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {change > 0 ? '+' : ''}{change} g
          </span>
        )}
      </TableCell>
      {onDelete && (
        <TableCell>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleDelete}
            aria-label="Delete weight record"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
});

WeightHistoryRow.displayName = "WeightHistoryRow";

// Create a specialized empty state component
const EmptyWeightHistory = memo(() => (
  <div className="text-center py-8 text-muted-foreground">
    <p>No weight history available.</p>
    <p className="mt-2">Add a weight record to start tracking.</p>
  </div>
));

EmptyWeightHistory.displayName = "EmptyWeightHistory";

// Final optimized component
const WeightHistoryListComponent = ({ weightHistory, onDeleteWeight }: WeightHistoryListProps) => {
  const componentId = useRef(Math.random().toString(36).substring(7));
  
  useEffect(() => {
    console.log(`[DEBUG-Render] WeightHistoryList ${componentId.current} mounted with ${weightHistory.length} records`);
    return () => console.log(`[DEBUG-Render] WeightHistoryList ${componentId.current} unmounting`);
  }, [weightHistory.length]);
  
  // Log when props change
  useEffect(() => {
    console.log(`[DEBUG-Render] WeightHistoryList ${componentId.current} received weightHistory update:`, {
      count: weightHistory.length,
      recordIds: weightHistory.slice(0, 2).map(r => r.id).join(', ') + (weightHistory.length > 2 ? '...' : '')
    });
  }, [weightHistory]);

  // If no history, show a clear message
  if (!weightHistory || weightHistory.length === 0) {
    console.log(`[DEBUG-Render] WeightHistoryList ${componentId.current} rendering empty state`);
    return <EmptyWeightHistory />;
  }

  // Memoize the sorted history
  const sortedHistory = useMemo(() => {
    const sorted = [...weightHistory].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    console.log(`[DEBUG-Render] WeightHistoryList ${componentId.current} memoized sortedHistory with ${sorted.length} records`);
    return sorted;
  }, [weightHistory]);

  // Create memoized row data to prevent re-calculation
  const rowData = useMemo(() => {
    const data = sortedHistory.map((record, index) => {
      if (!record || !record.id) return null;
      
      // Get the next record for change calculation
      const nextRecord = sortedHistory[index + 1];
      
      return {
        key: record.id,
        record,
        prevWeight: nextRecord?.weight
      };
    }).filter(Boolean); // Remove any null values
    
    console.log(`[DEBUG-Render] WeightHistoryList ${componentId.current} memoized rowData with ${data.length} rows`);
    return data;
  }, [sortedHistory]);

  // Wrap the delete handler with logging
  const handleDeleteWithLogging = useCallback((id: string) => {
    console.log(`[DEBUG-Action] WeightHistoryList ${componentId.current} delete handler called for record: ${id}`);
    onDeleteWeight?.(id);
  }, [onDeleteWeight]);

  console.log(`[DEBUG-Render] WeightHistoryList ${componentId.current} rendering with ${rowData.length} rows`);
  
  return (
    <div className="max-h-[350px] overflow-auto relative">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Weight (g)</TableHead>
            <TableHead>Change</TableHead>
            {onDeleteWeight && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rowData.map(item => (
            <WeightHistoryRow
              key={item.key}
              record={item.record}
              prevWeight={item.prevWeight}
              onDelete={handleDeleteWithLogging}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Create a memoized version of the component
const WeightHistoryList = memo(WeightHistoryListComponent);
WeightHistoryList.displayName = "WeightHistoryList";

// Export as both component and default
export { WeightHistoryList };
export default WeightHistoryList;
