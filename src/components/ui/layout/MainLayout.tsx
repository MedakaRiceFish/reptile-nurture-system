
import React from "react";
import { SideNav } from "./SideNav";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export const MainLayout = React.memo(function MainLayout({ children, pageTitle }: MainLayoutProps) {
  // Using direct return without any calculations in the render method
  // to minimize component complexity and improve rendering performance
  return (
    <div className="flex h-screen w-full bg-background">
      <div className="hidden md:flex h-screen border-r glass-panel">
        <SideNav />
      </div>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header pageTitle={pageTitle} />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
});
