
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { format, parseISO } from "date-fns";

interface WeightRecord {
  date: string;
  weight: number;
}

interface AnimalWeightChartProps {
  weightHistory: WeightRecord[];
}

export function AnimalWeightChart({ weightHistory }: AnimalWeightChartProps) {
  const chartConfig = {
    weight: {
      label: "Weight (g)",
      color: "#16a34a", // Green color
    },
  };

  console.log("Weight history for chart:", weightHistory);

  // Format the data for the chart
  const chartData = weightHistory.map(record => {
    // Ensure the date is properly parsed
    let formattedDate;
    try {
      formattedDate = format(parseISO(record.date), "MMM d, yyyy");
    } catch (e) {
      console.error("Date parsing error in chart:", e, record.date);
      formattedDate = record.date;
    }
    
    return {
      date: record.date,
      weight: record.weight,
      formattedDate,
    };
  });

  console.log("Formatted chart data:", chartData);

  return (
    <Card className="p-2 h-[400px]">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                try {
                  return format(parseISO(value), "MMM dd");
                } catch (e) {
                  console.error("XAxis date formatting error:", e, value);
                  return value;
                }
              }}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickMargin={10}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    let formattedDate;
    try {
      formattedDate = format(parseISO(label), "MMM d, yyyy");
    } catch (e) {
      console.error("Tooltip date formatting error:", e, label);
      formattedDate = label;
    }
    
    return (
      <ChartTooltipContent>
        <div className="bg-background border rounded-md shadow-md p-2">
          <p className="font-medium text-sm">
            {formattedDate}
          </p>
          <p className="text-sm">
            <span className="font-medium">Weight:</span> {payload[0].value} g
          </p>
        </div>
      </ChartTooltipContent>
    );
  }
  return null;
};
