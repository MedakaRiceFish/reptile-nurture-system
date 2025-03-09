
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ChevronRight } from "lucide-react";

export function QuickActions() {
  const actions = [
    { title: "Add New Reptile", description: "Register a new animal in the system" },
    { title: "Schedule Feeding", description: "Plan your next feeding time" },
    { title: "Configure Alerts", description: "Set up environment threshold alerts" },
    { title: "Connect Device", description: "Add a new controller or sensor" },
  ];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks you might want to perform</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, i) => (
            <div 
              key={i} 
              className="group flex items-start p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <div className="mr-3 mt-0.5 text-reptile-400">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{action.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="link" className="text-xs text-muted-foreground hover:text-foreground">
          View all actions
        </Button>
      </CardFooter>
    </Card>
  );
}
