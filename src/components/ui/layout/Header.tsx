
import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SideNav } from "./SideNav";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  pageTitle?: string;
}

export function Header({ pageTitle }: HeaderProps) {
  const { signOut, user } = useAuth();

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
