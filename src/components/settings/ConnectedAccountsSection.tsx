
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorPushAuthForm } from "./SensorPushAuthForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ConnectedAccountsSection() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Connect external services to enhance your zoo management experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sensorpush" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="sensorpush">SensorPush</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sensorpush">
            <SensorPushAuthForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
