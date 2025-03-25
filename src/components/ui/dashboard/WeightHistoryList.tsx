
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
  const handleDelete = useCallback((e: React.MouseEvent) => {
    // IMPORTANT: Stop propagation to prevent bubbling events
    e.preventDefault();
    e.stopPropagation();
    
    if (record.id && onDelete) {
      console.log(`[WeightHistoryRow] Delete button clicked for record: ${record.id}`);
      onDelete(record.id);
    }
  }, [record.id, onDelete]);

  return (
    <TableRow key={record.id}>
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
  // If no history, show a clear message
  if (!weightHistory || weightHistory.length === 0) {
    return <EmptyWeightHistory />;
  }

  // Memoize the sorted history
  const sortedHistory = useMemo(() => {
    return [...weightHistory].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [weightHistory]);

  // Create memoized row data to prevent re-calculation
  const rowData = useMemo(() => {
    return sortedHistory.map((record, index) => {
      if (!record || !record.id) return null;
      
      // Get the next record for change calculation
      const nextRecord = sortedHistory[index + 1];
      
      return {
        key: record.id,
        record,
        prevWeight: nextRecord?.weight
      };
    }).filter(Boolean); // Remove any null values
  }, [sortedHistory]);

  // Wrap the delete handler with event management
  const handleDeleteWithLogging = useCallback((id: string) => {
    console.log(`[WeightHistoryList] Delegating delete for record: ${id}`);
    onDeleteWeight?.(id);
  }, [onDeleteWeight]);
  
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
