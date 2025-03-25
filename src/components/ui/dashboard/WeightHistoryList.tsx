
import React, { useMemo, memo, useCallback } from "react";
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
  const handleDelete = useCallback(() => {
    if (record.id && onDelete) {
      onDelete(record.id);
    }
  }, [record.id, onDelete]);

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

// Use React.memo to prevent unnecessary re-renders
export const WeightHistoryList = memo(({ weightHistory, onDeleteWeight }: WeightHistoryListProps) => {
  // If no history, show a clear message
  if (!weightHistory || weightHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No weight history available.</p>
        <p className="mt-2">Add a weight record to start tracking.</p>
      </div>
    );
  }

  // Memoize the sorted history
  const sortedHistory = useMemo(() => {
    if (!weightHistory || !Array.isArray(weightHistory)) return [];
    
    return [...weightHistory].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [weightHistory]);

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
          {sortedHistory.map((record, index) => {
            // Skip records without IDs for safety
            if (!record || !record.id) return null;
            
            // Get the next record for change calculation
            const nextRecord = sortedHistory[index + 1];
            
            return (
              <WeightHistoryRow
                key={record.id}
                record={record}
                prevWeight={nextRecord?.weight}
                onDelete={onDeleteWeight}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});

WeightHistoryList.displayName = "WeightHistoryList";
