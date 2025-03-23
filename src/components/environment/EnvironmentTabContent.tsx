
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Thermometer, Droplet, Sun, Monitor, AlertTriangle, Lock } from "lucide-react";

interface EnvironmentTabContentProps {
  enclosure: any;
  getTemperatureColor: (temp: number) => string;
  getHumidityColor: (hum: number) => string;
}

export const EnvironmentTabContent: React.FC<EnvironmentTabContentProps> = ({
  enclosure,
  getTemperatureColor,
  getHumidityColor
}) => {
  return (
    <>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Environment Overview</CardTitle>
            <CardDescription>
              Comprehensive view of the enclosure's environmental conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This {enclosure.type.toLowerCase()} environment is designed to replicate the natural habitat for {enclosure.inhabitants.map(i => i.species).join(" and ")}. It maintains optimal temperature and humidity levels with automated systems.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Climate Control</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                      <Thermometer className="h-3 w-3 text-reptile-600" />
                    </span>
                    <span>Daytime temperature: {enclosure.temperature}°F (regulated)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                      <Thermometer className="h-3 w-3 text-reptile-600" />
                    </span>
                    <span>Nighttime temperature: {enclosure.temperature - 5}°F (natural drop)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                      <Droplet className="h-3 w-3 text-reptile-600" />
                    </span>
                    <span>Humidity maintained at {enclosure.humidity}% with misting system</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                      <Sun className="h-3 w-3 text-reptile-600" />
                    </span>
                    <span>UVB lighting on 12-hour cycle with sunrise/sunset simulation</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Monitoring</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                      <Monitor className="h-3 w-3 text-reptile-600" />
                    </span>
                    <span>Wireless sensors with real-time data collection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                      <AlertTriangle className="h-3 w-3 text-reptile-600" />
                    </span>
                    <span>Automated alerts for environmental deviations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-reptile-100 p-1 rounded-full mr-2 mt-0.5">
                      <Lock className="h-3 w-3 text-reptile-600" />
                    </span>
                    <span>Secure, remote access to system controls</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Temperature & Humidity History</CardTitle>
            <CardDescription>
              Recorded environmental data for {enclosure.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Date</th>
                    <th className="text-left pb-2">Temperature</th>
                    <th className="text-left pb-2">Humidity</th>
                  </tr>
                </thead>
                <tbody>
                  {enclosure.history.map((record: any, index: number) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3">{record.date}</td>
                      <td className={`py-3 ${getTemperatureColor(record.temp)}`}>
                        {record.temp}°F
                      </td>
                      <td className={`py-3 ${getHumidityColor(record.humidity)}`}>
                        {record.humidity}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="maintenance">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
            <CardDescription>
              Upcoming and past maintenance activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-12">
              Maintenance schedule information will be available soon.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Environment Settings</CardTitle>
            <CardDescription>
              Configure the enclosure environment settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-12">
              Environment control settings will be available soon.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};
