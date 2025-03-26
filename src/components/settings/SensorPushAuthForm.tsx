
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authenticateSensorPush, getSensorPushToken, fetchSensors } from "@/services/sensorPush";
import { toast } from "sonner";
import { CheckCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function SensorPushAuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [deviceCount, setDeviceCount] = useState<number>(0);

  useEffect(() => {
    // Check if we already have a valid token
    const checkConnection = async () => {
      const token = await getSensorPushToken();
      setIsConnected(!!token);
      
      if (token) {
        // Set a simulated last sync time (in a real app, store this in the database)
        setLastSyncTime(new Date());
        
        // Fetch sensors to get the device count
        try {
          const sensors = await fetchSensors();
          if (sensors) {
            setDeviceCount(sensors.length);
          }
        } catch (error) {
          console.error("Error fetching sensor count:", error);
        }
      }
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = await authenticateSensorPush({ email, password });
      
      if (token) {
        toast.success("Successfully connected to SensorPush");
        setEmail("");
        setPassword("");
        setIsConnected(true);
        setShowLoginForm(false);
        setLastSyncTime(new Date());
        
        // Fetch sensors to get the device count after successful authentication
        try {
          const sensors = await fetchSensors();
          if (sensors) {
            setDeviceCount(sensors.length);
          }
        } catch (error) {
          console.error("Error fetching sensor count:", error);
        }
      }
    } catch (error) {
      console.error("SensorPush authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconnect = () => {
    setShowLoginForm(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Connect SensorPush</CardTitle>
            <CardDescription>
              {isConnected 
                ? "Your SensorPush account is connected and actively syncing sensor data" 
                : "Enter your SensorPush account credentials to connect your sensors"}
            </CardDescription>
          </div>
          {isConnected && (
            <div className="flex items-center text-green-500">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      {isConnected && !showLoginForm ? (
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Last synced</p>
                <p className="text-xs text-muted-foreground">
                  {lastSyncTime ? lastSyncTime.toLocaleString() : "Never"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Devices Found: {deviceCount}
                </p>
              </div>
              <Collapsible>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleReconnect}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reconnect
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="pt-4">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                          {isLoading ? "Connecting..." : "Reconnect Account"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading 
                ? "Connecting..." 
                : isConnected 
                  ? "Reconnect SensorPush Account" 
                  : "Connect SensorPush Account"
              }
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
