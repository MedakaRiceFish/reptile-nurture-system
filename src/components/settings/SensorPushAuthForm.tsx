
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authenticateSensorPush, getSensorPushToken } from "@/services/sensorPush/sensorPushAuthService";
import { fetchSensors } from "@/services/sensorPush/sensorPushSensorService";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, RefreshCw, Shield } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SensorPushSensor } from "@/types/sensorpush";
import { Badge } from "@/components/ui/badge";

export function SensorPushAuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [deviceCount, setDeviceCount] = useState<number>(0);
  const [sensors, setSensors] = useState<SensorPushSensor[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'disconnected' | 'error'>('loading');

  useEffect(() => {
    // Check if we already have a valid token
    const checkConnection = async () => {
      setConnectionStatus('loading');
      const token = await getSensorPushToken();
      setIsConnected(!!token);
      
      if (token) {
        try {
          setIsLoading(true);
          // Set last sync time to now
          setLastSyncTime(new Date());
          
          // Fetch sensors to get the device count
          const fetchedSensors = await fetchSensors();
          
          if (fetchedSensors && fetchedSensors.length > 0) {
            setDeviceCount(fetchedSensors.length);
            setSensors(fetchedSensors);
            setConnectionStatus('connected');
            console.log(`Connected to SensorPush with ${fetchedSensors.length} sensors:`, 
                        fetchedSensors.map(s => s.name).join(', '));
          } else {
            setConnectionStatus('error');
            console.warn("No sensors found or connection issue");
          }
        } catch (error) {
          console.error("Error checking connection:", error);
          setConnectionStatus('error');
        } finally {
          setIsLoading(false);
        }
      } else {
        setConnectionStatus('disconnected');
      }
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setConnectionStatus('loading');

    try {
      // Real authentication
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
          const fetchedSensors = await fetchSensors();
          if (fetchedSensors && fetchedSensors.length > 0) {
            setDeviceCount(fetchedSensors.length);
            setSensors(fetchedSensors);
            setConnectionStatus('connected');
            console.log(`Connected to SensorPush with ${fetchedSensors.length} sensors:`, 
                        fetchedSensors.map(s => s.name).join(', '));
          } else {
            setConnectionStatus('error');
            toast.error("Authentication successful but no sensors found");
          }
        } catch (error) {
          console.error("Error fetching sensor count:", error);
          setConnectionStatus('error');
        }
      } else {
        toast.error("Failed to connect to SensorPush");
        setConnectionStatus('disconnected');
      }
    } catch (error: any) {
      console.error("SensorPush authentication error:", error);
      toast.error(`Authentication failed: ${error.message}`);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconnect = () => {
    setShowLoginForm(true);
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setConnectionStatus('loading');
      const fetchedSensors = await fetchSensors();
      
      if (fetchedSensors && fetchedSensors.length > 0) {
        setDeviceCount(fetchedSensors.length);
        setSensors(fetchedSensors);
        setLastSyncTime(new Date());
        setConnectionStatus('connected');
        toast.success(`Refreshed sensors: Found ${fetchedSensors.length} devices`);
        console.log(`Connected to SensorPush with ${fetchedSensors.length} sensors:`, 
                    fetchedSensors.map(s => s.name).join(', '));
      } else {
        setConnectionStatus('error');
        toast.error("No sensors found or connection issue");
      }
    } catch (error: any) {
      setConnectionStatus('error');
      toast.error(`Error refreshing sensors: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = () => {
    switch(connectionStatus) {
      case 'loading':
        return (
          <div className="flex items-center text-muted-foreground">
            <RefreshCw className="h-5 w-5 mr-1 animate-spin" />
            <span className="text-sm font-medium">Checking...</span>
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center text-green-500">
            <CheckCircle className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">Connected</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-amber-500">
            <AlertCircle className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">Issues Found</span>
          </div>
        );
      case 'disconnected':
        return (
          <div className="flex items-center text-muted-foreground">
            <Shield className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">Not Connected</span>
          </div>
        );
    }
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
          {getStatusDisplay()}
        </div>
      </CardHeader>
      
      {isConnected && !showLoginForm ? (
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Last synced</p>
                  <p className="text-xs text-muted-foreground">
                    {lastSyncTime ? lastSyncTime.toLocaleString() : "Never"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">
                    Devices Found: {deviceCount}
                  </p>
                  {sensors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Connected Sensors:</p>
                      <div className="flex flex-wrap gap-1">
                        {sensors.map(sensor => (
                          <Badge key={sensor.id} variant="outline" className="text-xs">
                            {sensor.name} {sensor.active ? "✓" : "⚠️"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Collapsible>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? "Refreshing..." : "Refresh"}
                  </Button>
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
