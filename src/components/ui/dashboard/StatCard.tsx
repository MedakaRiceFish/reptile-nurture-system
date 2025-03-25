
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
  // Format the title to include a line break if it's the "ACTIVE ALERTS" title
  const formattedTitle = title === "ACTIVE ALERTS" ? "ACTIVE<br />ALERTS" : title;

  const CardContent = () => (
    <div className="flex flex-col h-full">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide" dangerouslySetInnerHTML={{ __html: formattedTitle }}></h3>
        <div className="p-3 bg-reptile-50 text-reptile-500 rounded-xl">
          {icon}
        </div>
      </div>
      
      {/* Spacer - fixed height to ensure consistent spacing */}
      <div className="h-12"></div>
      
      {/* Value section - positioned at the bottom */}
      <div className="mt-auto">
        <div className="flex items-center">
          <span className="text-3xl font-semibold tracking-tight">{value}</span>
          {isAlert && Number(value) > 0 && (
            <span className="ml-2 bg-red-500 text-white rounded-full w-2 h-2 inline-block"></span>
          )}
        </div>
        
        {change && (
          <p className="text-sm flex items-center gap-1 mt-1">
            <span className={cn(
              change.positive ? "text-green-600" : "text-red-600"
            )}>
              {change.positive ? "↑" : "↓"} {change.value}
            </span>
            <span className="text-muted-foreground">vs. last week</span>
          </p>
        )}
      </div>
    </div>
  );

  const cardClasses = cn(
    "bg-white/70 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg",
    "p-6 rounded-2xl transition-all duration-300 hover:shadow-md hover:scale-[1.01]",
    "h-[180px] flex flex-col",
    className
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className={cardClasses}>
        <CardContent />
      </Link>
    );
  }
  
  return (
    <div className={cardClasses}>
      <CardContent />
    </div>
  );
}
