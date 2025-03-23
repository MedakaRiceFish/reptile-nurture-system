
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string | number;
    positive: boolean;
  };
  className?: string;
  isAlert?: boolean;
  linkTo?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  change, 
  className,
  isAlert = false,
  linkTo
}: StatCardProps) {
  // Card content to ensure consistent rendering whether it's a link or not
  const CardContent = () => (
    <>
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</h3>
        <div className="p-3 bg-reptile-50 text-reptile-500 rounded-xl">
          {icon}
        </div>
      </div>
      
      <div className="pt-8">
        <div className="flex items-center">
          <span className="text-3xl font-semibold tracking-tight">{value}</span>
          {isAlert && Number(value) > 0 && (
            <span className="ml-2 bg-red-500 text-white rounded-full w-2 h-2 inline-block"></span>
          )}
        </div>
        
        {change && (
          <p className="text-sm flex items-center gap-1 mt-2">
            <span className={cn(
              change.positive ? "text-green-600" : "text-red-600"
            )}>
              {change.positive ? "↑" : "↓"} {change.value}
            </span>
            <span className="text-muted-foreground">vs. last week</span>
          </p>
        )}
      </div>
    </>
  );

  return (
    <div className={cn(
      "bg-white/70 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg",
      "p-6 rounded-2xl transition-all duration-300 hover:shadow-md hover:scale-[1.01]",
      "h-[180px] flex flex-col",
      className
    )}>
      {isAlert && linkTo && Number(value) > 0 ? (
        <Link to={linkTo} className="flex flex-col h-full">
          <CardContent />
        </Link>
      ) : (
        <CardContent />
      )}
    </div>
  );
}
