
import React, { useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { WeightRecord } from "@/hooks/animal-record/types";

interface WeightHistoryListProps {
  weightHistory: WeightRecord[];
  onDeleteWeight?: (id: string) => void;
}

export function WeightHistoryList({ weightHistory, onDeleteWeight }: WeightHistoryListProps) {
  // If no history, show a clear message
  if (!weightHistory || weightHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No weight history available.</p>
        <p className="mt-2">Add a weight record to start tracking.</p>
      </div>
    );
  }

  // Memoize the sorted history to avoid re-sorting on every render
  const sortedHistory = useMemo(() => {
    return [...weightHistory].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [weightHistory]);

  // Handle delete click with proper event handling
  const handleDeleteClick = useCallback((
    event: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    // Stop event propagation to prevent tab switching or parent reflows
    event.preventDefault();
    event.stopPropagation();
    
    if (onDeleteWeight && id) {
      // Call the delete handler synchronously
      onDeleteWeight(id);
    }
  }, [onDeleteWeight]);

  // Create a formatting function that handles errors gracefully
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (e) {
      console.warn("Date formatting error:", e, dateString);
      return dateString;
    }
  }, []);

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
            if (onDeleteWeight && !record.id) {
              return null;
            }
            
            // Calculate weight change
            const nextRecord = sortedHistory[index + 1];
            const change = nextRecord 
              ? record.weight - nextRecord.weight 
              : 0;
            
            // Pre-format the date outside of the render to improve performance
            const formattedDate = formatDate(record.date);
            
            return (
              <TableRow key={record.id || `${record.date}-${index}`}>
                <TableCell>{formattedDate}</TableCell>
                <TableCell className="font-medium">{record.weight}</TableCell>
                <TableCell>
                  {index < sortedHistory.length - 1 && (
                    <span className={`${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {change > 0 ? '+' : ''}{change} g
                    </span>
                  )}
                </TableCell>
                {onDeleteWeight && record.id && (
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => handleDeleteClick(e, record.id!)}
                      title="Delete record"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          onDeleteWeight(record.id!);
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Delete record</span>
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
