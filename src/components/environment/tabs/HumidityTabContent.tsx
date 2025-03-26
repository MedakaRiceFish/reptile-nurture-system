
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SensorChart } from "@/components/ui/dashboard/SensorChart";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { fetchSensorSamples, getEnclosureSensor } from "@/services/sensorPush";
import { SensorPushSample } from "@/types/sensorpush";
import { Droplets } from "lucide-react";
import { SensorChartData } from "@/types/charts";

interface HumidityTabContentProps {
  enclosureId?: string;
}

export const HumidityTabContent: React.FC<HumidityTabContentProps> = ({ enclosureId }) => {
  const [sensorId, setSensorId] = useState<string | null>(null);
  const [sensorData, setSensorData] = useState<SensorPushSample[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enclosureId) return;

    const fetchSensorId = async () => {
      const id = await getEnclosureSensor(enclosureId);
      setSensorId(id);
    };

    fetchSensorId();
  }, [enclosureId]);

  useEffect(() => {
    if (!sensorId) return;

    const fetchHumidityData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const samples = await fetchSensorSamples(sensorId, 100);
        if (samples) {
          setSensorData(samples);
        } else {
          setError("Failed to fetch sensor data");
        }
      } catch (err) {
        setError("Error loading sensor data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHumidityData();
  }, [sensorId]);

  // Format data for the chart
  const chartData: SensorChartData[] = sensorData.map(sample => ({
    timestamp: new Date(sample.observation).getTime(),
    value: sample.humidity,
    time: format(new Date(sample.observation), 'HH:mm')
  })).sort((a, b) => a.timestamp - b.timestamp);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Humidity History</CardTitle>
        <CardDescription>
          {sensorId 
            ? "Humidity data from SensorPush sensor" 
            : "No SensorPush sensor connected. Add a Sensor device to view live data."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="readings">Readings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart">
            <div className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading humidity data...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">{error}</p>
                </div>
              ) : chartData.length > 0 ? (
                <SensorChart 
                  data={chartData} 
                  type="humidity" 
                  unit="%" 
                />
              ) : sensorId ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No humidity data available</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Droplets className="h-12 w-12 mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Connect a SensorPush sensor to view humidity history</p>
                  <p className="text-sm text-muted-foreground mt-2">Go to the Hardware tab and add a Sensor device</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="readings">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading humidity readings...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : sensorData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Humidity (%)</TableHead>
                    <TableHead>Temperature (°F)</TableHead>
                    <TableHead>Dew Point (°F)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sensorData
                    .sort((a, b) => new Date(b.observation).getTime() - new Date(a.observation).getTime())
                    .slice(0, 10)
                    .map((reading) => (
                      <TableRow key={reading.id}>
                        <TableCell>{format(new Date(reading.observation), 'MMM d, yyyy HH:mm:ss')}</TableCell>
                        <TableCell>{reading.humidity.toFixed(1)}%</TableCell>
                        <TableCell>{reading.temperature.toFixed(1)}°F</TableCell>
                        <TableCell>{reading.dewpoint.toFixed(1)}°F</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : sensorId ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No humidity readings available.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Droplets className="h-12 w-12 mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Connect a SensorPush sensor to view humidity readings</p>
                <p className="text-sm text-muted-foreground mt-2">Go to the Hardware tab and add a Sensor device</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
