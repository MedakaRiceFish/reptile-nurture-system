
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
  return (
    <div className={cn("dash-stat", className)}>
      <div className="flex justify-between items-start mb-6">
        <h3 className="dash-header">{title}</h3>
        <div className="p-3 bg-reptile-50 text-reptile-500 rounded-xl">
          {icon}
        </div>
      </div>
      
      <div>
        {isAlert && linkTo && Number(value) > 0 ? (
          <Link to={linkTo} className="block">
            <p className={cn(
              "dash-value",
              isAlert && Number(value) > 0 && "flex items-center"
            )}>
              {value}
              {isAlert && Number(value) > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full w-2 h-2 inline-block"></span>
              )}
            </p>
          </Link>
        ) : (
          <p className="dash-value">{value}</p>
        )}
        
        {change && (
          <p className="mt-2 text-sm flex items-center gap-1">
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
}
