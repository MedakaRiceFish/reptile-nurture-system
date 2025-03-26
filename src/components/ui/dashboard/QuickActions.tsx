
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function QuickActions() {
  const { user } = useAuth();
  const [isMarkFedDialogOpen, setIsMarkFedDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const actions = [
    { title: "Add New Reptile", description: "Register a new animal in the system" },
    { title: "Mark All Animals Fed", description: "Update feeding records for all animals" },
    { title: "Configure Alerts", description: "Set up environment threshold alerts" },
    { title: "Connect Device", description: "Add a new controller or sensor" },
  ];

  const handleMarkAllFed = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('animals')
        .update({ last_fed_date: now })
        .eq('owner_id', user.id);
      
      if (error) throw error;
      
      toast.success("All animals marked as fed successfully!");
      setIsMarkFedDialogOpen(false);
    } catch (error) {
      console.error("Error marking animals as fed:", error);
      toast.error("Failed to mark animals as fed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (actionTitle: string) => {
    if (actionTitle === "Mark All Animals Fed") {
      setIsMarkFedDialogOpen(true);
    }
    // Handle other action clicks as needed
  };

  return (
    <>
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
                onClick={() => handleActionClick(action.title)}
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

      <Dialog open={isMarkFedDialogOpen} onOpenChange={setIsMarkFedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark All Animals Fed</DialogTitle>
            <DialogDescription>
              This will update the "Last Fed Date" for all your animals to the current time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarkFedDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleMarkAllFed} 
              disabled={isLoading}
              className="bg-reptile-500 hover:bg-reptile-600"
            >
              {isLoading ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
