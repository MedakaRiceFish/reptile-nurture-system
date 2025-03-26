
import React from "react";

interface DetailsItemProps {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const DetailsItem = ({ label, children, action }: DetailsItemProps) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{children}</span>
        {action && action}
      </div>
    </div>
  );
};
