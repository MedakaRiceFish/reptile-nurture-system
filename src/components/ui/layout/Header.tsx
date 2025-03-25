
import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Menu, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SideNav } from "./SideNav";
import { useAuth } from "@/context/AuthContext";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { cn } from "@/lib/utils";

interface HeaderProps {
  pageTitle?: string;
}

export function Header({ pageTitle }: HeaderProps) {
  const { signOut, user } = useAuth();
  const { renderLatency, pageLoadTime } = usePerformanceMonitor();
  
  // Only show this to admin users
  const isAdmin = user?.email?.includes('admin') || process.env.NODE_ENV === 'development';

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
        {isAdmin && renderLatency && (
          <div className="hidden md:flex items-center text-xs text-muted-foreground mr-2">
            <Clock className="h-3 w-3 mr-1" />
            <span className={cn(
              renderLatency > 500 ? "text-destructive" : 
              renderLatency > 200 ? "text-amber-500" : 
              "text-emerald-500"
            )}>
              REN: {renderLatency}ms
              {pageLoadTime && pageLoadTime !== renderLatency && ` / TTL: ${pageLoadTime}ms`}
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
          <Button variant="ghost" size="icon" onClick={() => signOut()}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sign out</span>
          </Button>
        )}
      </div>
    </header>
  );
}
