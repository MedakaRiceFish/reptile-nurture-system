
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Menu, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SideNav } from "./SideNav";
import { useAuth } from "@/context/AuthContext";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface HeaderProps {
  pageTitle?: string;
}

export function Header({ pageTitle }: HeaderProps) {
  const { signOut, user } = useAuth();
  const { renderLatency, pageLoadTime } = usePerformanceMonitor();
  const [displayRenderLatency, setDisplayRenderLatency] = useState<number | null>(null);
  const [displayPageLoadTime, setDisplayPageLoadTime] = useState<number | null>(null);
  const navigate = useNavigate();
  
  // Update the displayed metrics when they change
  useEffect(() => {
    if (renderLatency !== null) {
      setDisplayRenderLatency(renderLatency);
    }
    if (pageLoadTime !== null) {
      setDisplayPageLoadTime(pageLoadTime);
    }
  }, [renderLatency, pageLoadTime]);

  // Only show metrics to admin users or in development
  const isAdmin = user?.email?.includes('admin') || process.env.NODE_ENV === 'development';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Redirecting to login...");
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b h-14 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SideNav />
          </SheetContent>
        </Sheet>
        
        <div className="text-xl font-semibold">{pageTitle}</div>
      </div>
      
      <div className="flex items-center gap-2">
        {isAdmin && (
          <div className="hidden md:flex items-center text-xs text-muted-foreground mr-2">
            <Clock className="h-3 w-3 mr-1" />
            <span className={cn(
              displayRenderLatency && displayRenderLatency > 500 ? "text-destructive" : 
              displayRenderLatency && displayRenderLatency > 200 ? "text-amber-500" : 
              "text-emerald-500"
            )}>
              REN: {displayRenderLatency ?? '...'}ms
              {displayPageLoadTime && ` / TTL: ${displayPageLoadTime}ms`}
            </span>
          </div>
        )}
        
        <Button variant="ghost" size="icon" asChild>
          <a href="/notifications">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </a>
        </Button>
        
        {user && (
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sign out</span>
          </Button>
        )}
      </div>
    </header>
  );
}
