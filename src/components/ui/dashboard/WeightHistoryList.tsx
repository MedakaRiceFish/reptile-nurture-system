
import React, { useMemo } from "react";
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

  // Memoize the sorted history
  const sortedHistory = useMemo(() => {
    return [...weightHistory].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [weightHistory]);

  // Create a formatting function that handles errors gracefully
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

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
            if (!record.id) return null;
            
            // Calculate weight change
            const nextRecord = sortedHistory[index + 1];
            const change = nextRecord 
              ? record.weight - nextRecord.weight 
              : 0;
            
            // Format date
            const formattedDate = formatDate(record.date);
            
            return (
              <TableRow key={record.id}>
                <TableCell>{formattedDate}</TableCell>
                <TableCell className="font-medium">{record.weight}</TableCell>
                <TableCell>
                  {index < sortedHistory.length - 1 && (
                    <span className={`${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {change > 0 ? '+' : ''}{change} g
                    </span>
                  )}
                </TableCell>
                {onDeleteWeight && (
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        // Direct function call, no event manipulation
                        if (record.id) onDeleteWeight(record.id);
                      }}
                      aria-label="Delete weight record"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
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
