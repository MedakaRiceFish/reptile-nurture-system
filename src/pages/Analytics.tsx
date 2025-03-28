
import React from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, LineChart, PieChart, Activity, TrendingUp, Thermometer } from "lucide-react";
import { ANIMALS_DATA } from "@/data/animalsData";
import { SensorChart } from "@/components/ui/dashboard/SensorChart";
import { WeightTrendsChart } from "@/components/analytics/WeightTrendsChart";
import { SpeciesDistribution } from "@/components/analytics/SpeciesDistribution";
import { ActivitySummary } from "@/components/analytics/ActivitySummary";
import { SensorChartData } from "@/types/charts";

const Analytics = () => {
  // Prepare demo data for the sensor charts
  const tempData: SensorChartData[] = [
    { timestamp: Date.now(), value: 75, time: 'Now' },
    { timestamp: Date.now() - 3600000, value: 76, time: '1h ago' },
    { timestamp: Date.now() - 7200000, value: 77, time: '2h ago' },
    { timestamp: Date.now() - 10800000, value: 75, time: '3h ago' },
    { timestamp: Date.now() - 14400000, value: 74, time: '4h ago' },
  ];
  
  const humidityData: SensorChartData[] = [
    { timestamp: Date.now(), value: 55, time: 'Now' },
    { timestamp: Date.now() - 3600000, value: 54, time: '1h ago' },
    { timestamp: Date.now() - 7200000, value: 57, time: '2h ago' },
    { timestamp: Date.now() - 10800000, value: 56, time: '3h ago' },
    { timestamp: Date.now() - 14400000, value: 53, time: '4h ago' },
  ];

  return (
    <MainLayout pageTitle="Data & Analytics">
      <div className="max-w-[1600px] mx-auto animate-fade-up">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="animals" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Weight Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="environment" className="flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                <span>Environment</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ANIMALS_DATA.length}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tracked across {ANIMALS_DATA.reduce((acc, curr) => {
                      if (!acc.includes(curr.species)) acc.push(curr.species);
                      return acc;
                    }, []).length} species
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Weight</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(ANIMALS_DATA.reduce((acc, curr) => acc + curr.weight, 0) / ANIMALS_DATA.length)} g
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on latest weight records
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Healthy Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">100%</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    All animals at healthy weights
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Enclosures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(ANIMALS_DATA.map(animal => animal.enclosure)).size}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Monitoring environmental conditions
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SpeciesDistribution />
              <ActivitySummary />
            </div>
          </TabsContent>
          
          <TabsContent value="animals" className="space-y-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Weight Trends By Animal</CardTitle>
              </CardHeader>
              <CardContent>
                <WeightTrendsChart />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="environment" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Temperature Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <SensorChart data={tempData} type="temperature" unit="°F" />
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Humidity Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <SensorChart data={humidityData} type="humidity" unit="%" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Analytics;
