
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SensorChartProps } from "@/types/charts";

// This is used for the demo chart when no data is provided
const generateData = (days = 7, baseTemp = 80, baseHumidity = 60) => {
  const data = [];
  for (let i = 0; i < days; i++) {
    for (let h = 0; h < 24; h += 3) {
      // Create some natural variation
      const tempVariation = Math.sin(h / 24 * Math.PI) * 5;
      const humVariation = Math.cos(h / 24 * Math.PI) * 10;
      
      data.push({
        time: `Day ${i+1}, ${h}:00`,
        temperature: Math.round((baseTemp + tempVariation + (Math.random() * 2 - 1)) * 10) / 10,
        humidity: Math.round((baseHumidity + humVariation + (Math.random() * 4 - 2)) * 10) / 10,
        light: h >= 7 && h <= 19 ? Math.round(180 + Math.random() * 70) : Math.round(20 + Math.random() * 30),
        pressure: Math.round((1013 + Math.random() * 3 - 1.5) * 10) / 10,
      });
    }
  }
  return data;
};

const demoData = generateData();

export function SensorChart({ data, type, unit }: SensorChartProps) {
  const [timeframe, setTimeframe] = useState('week');
  
  // Use the provided data, or fallback to demo data if none is provided
  const chartData = data?.length > 0 ? data : demoData;
  
  // Define colors based on sensor type
  const lineColor = type === 'temperature' ? '#4f906c' : '#6b9ad2';
  const lineDataKey = 'value';
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{type === 'temperature' ? 'Temperature' : 'Humidity'} Trends</CardTitle>
          <Tabs defaultValue="week" value={timeframe} onValueChange={setTimeframe} className="w-[300px]">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData.slice(0, timeframe === 'day' ? 8 : timeframe === 'week' ? 24 : chartData.length)}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }} 
                interval={timeframe === 'day' ? 0 : 2}  
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 12 }} 
                label={{ 
                  value: unit, 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { textAnchor: 'middle' } 
                }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px', 
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  padding: '8px 12px',
                }} 
                formatter={(value: any) => [`${value} ${unit}`, type]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={lineDataKey} 
                name={type === 'temperature' ? 'Temperature' : 'Humidity'}
                stroke={lineColor} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
