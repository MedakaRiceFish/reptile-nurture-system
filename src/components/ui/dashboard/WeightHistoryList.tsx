
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
  console.log("WeightHistoryList rendering with", weightHistory?.length, "records");
  
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

  // Memoized handler to avoid recreating on every render
  const handleDeleteClick = useCallback((event: React.MouseEvent, id: string) => {
    // Prevent event bubbling to avoid tab switching
    event.preventDefault();
    event.stopPropagation();
    
    if (onDeleteWeight && id) {
      console.log("WeightHistoryList: Deleting record with ID:", id);
      onDeleteWeight(id);
    }
  }, [onDeleteWeight]);

  return (
    <div className="max-h-[350px] overflow-auto">
      <Table>
        <TableHeader>
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
              console.warn("Record missing ID:", record);
              return null;
            }
            
            // Calculate weight change
            const nextRecord = sortedHistory[index + 1];
            const change = nextRecord 
              ? record.weight - nextRecord.weight 
              : 0;
            
            // Create a formatting function that handles errors gracefully
            const formatDate = (dateString: string) => {
              try {
                return format(parseISO(dateString), "MMM d, yyyy");
              } catch (e) {
                console.warn("Date formatting error:", e, dateString);
                return dateString;
              }
            };
            
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
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => handleDeleteClick(e, record.id!)}
                      title="Delete record"
                    >
                      <X className="h-4 w-4" />
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
