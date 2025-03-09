
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Example data - in a real app, this would come from an API
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

const data = generateData();

export function SensorChart() {
  const [timeframe, setTimeframe] = useState('week');
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Environment Trends</CardTitle>
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
              data={data.slice(0, timeframe === 'day' ? 8 : timeframe === 'week' ? 24 : data.length)}
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
              <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 300]} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px', 
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  padding: '8px 12px',
                }} 
              />
              <Legend wrapperStyle={{ paddingTop: 12 }} />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="temperature" 
                stroke="#4f906c" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="humidity" 
                stroke="#6b9ad2" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="light" 
                stroke="#d6a555" 
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
