
import React from "react";
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
}

export function StatCard({ title, value, icon, change, className }: StatCardProps) {
  return (
    <div className={cn("dash-stat", className)}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="dash-header">{title}</h3>
          <p className="dash-value">{value}</p>
          
          {change && (
            <p className="mt-1 text-sm flex items-center gap-1">
              <span className={cn(
                change.positive ? "text-green-600" : "text-red-600"
              )}>
                {change.positive ? "↑" : "↓"} {change.value}
              </span>
              <span className="text-muted-foreground">vs. last week</span>
            </p>
          )}
        </div>
        
        <div className="p-3 bg-reptile-50 text-reptile-500 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}
