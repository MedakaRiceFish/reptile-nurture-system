
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authenticateSensorPush, getSensorPushToken } from "@/services/sensorPush";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

export function SensorPushAuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if we already have a valid token
    const checkConnection = async () => {
      const token = await getSensorPushToken();
      setIsConnected(!!token);
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
      }
    } catch (error) {
      console.error("SensorPush authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Connect SensorPush</CardTitle>
            <CardDescription>
              Enter your SensorPush account credentials to connect your sensors
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
    </Card>
  );
}
