
import React from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Thermometer, Droplet, Activity } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Sample alert data
const ALERTS_DATA = [
  {
    id: 1,
    enclosureId: 1,
    enclosureName: "Bearded Dragon Habitat",
    type: "temperature",
    severity: "high",
    message: "Temperature above threshold (95°F)",
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    value: "95°F",
    threshold: "90°F",
    status: "active"
  },
  {
    id: 2,
    enclosureId: 3,
    enclosureName: "Ball Python Enclosure",
    type: "humidity",
    severity: "medium",
    message: "Humidity below threshold (50%)",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    value: "50%",
    threshold: "60%",
    status: "active"
  },
  {
    id: 3,
    enclosureId: 2,
    enclosureName: "Leopard Gecko Habitat",
    type: "temperature",
    severity: "low",
    message: "Temperature fluctuation detected",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    value: "82°F",
    threshold: "±5°F",
    status: "active"
  }
];

const Alerts = () => {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "temperature":
        return <Thermometer className="h-4 w-4" />;
      case "humidity":
        return <Droplet className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive" className="flex gap-1 items-center"><AlertTriangle className="h-3 w-3" /> High</Badge>;
      case "medium":
        return <Badge variant="default" className="bg-orange-500 flex gap-1 items-center"><AlertTriangle className="h-3 w-3" /> Medium</Badge>;
      case "low":
        return <Badge variant="default" className="bg-yellow-500 flex gap-1 items-center"><AlertTriangle className="h-3 w-3" /> Low</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <MainLayout pageTitle="Active Alerts">
      <div className="max-w-[1600px] mx-auto animate-fade-up">
        <div className="glass-card p-8 rounded-2xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Active Alerts</h2>
              <p className="text-muted-foreground">
                Monitoring and addressing real-time alerts for all enclosures
              </p>
            </div>
            <div className="flex items-center">
              <Badge variant="destructive" className="text-md px-3 py-1">
                {ALERTS_DATA.length} Active
              </Badge>
            </div>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alert List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Enclosure</TableHead>
                  <TableHead>Alert Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALERTS_DATA.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                    <TableCell>{alert.enclosureName}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <span className="capitalize">{alert.type}</span>
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>
                      <span className="font-medium">{alert.value}</span>
                      <span className="text-muted-foreground text-xs ml-2">(Threshold: {alert.threshold})</span>
                    </TableCell>
                    <TableCell className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(alert.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Alerts;
