
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";

interface WeightRecord {
  date: string;
  weight: number;
}

interface WeightHistoryListProps {
  weightHistory: WeightRecord[];
}

export function WeightHistoryList({ weightHistory }: WeightHistoryListProps) {
  // Sort the weight history by date (newest first)
  const sortedHistory = [...weightHistory].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  console.log("Sorted weight history:", sortedHistory);

  return (
    <div className="max-h-[350px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Weight (g)</TableHead>
            <TableHead>Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHistory.map((record, index) => {
            // Calculate weight change
            const nextRecord = sortedHistory[index + 1];
            const change = nextRecord 
              ? record.weight - nextRecord.weight 
              : 0;
            
            // Ensure date is properly parsed
            const formattedDate = (() => {
              try {
                return format(parseISO(record.date), "MMM d, yyyy");
              } catch (e) {
                console.error("Date parsing error:", e, record.date);
                return record.date;
              }
            })();
            
            return (
              <TableRow key={`${record.date}-${index}`}>
                <TableCell>{formattedDate}</TableCell>
                <TableCell className="font-medium">{record.weight}</TableCell>
                <TableCell>
                  {index < sortedHistory.length - 1 && (
                    <span className={`${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {change > 0 ? '+' : ''}{change} g
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
