
import React from "react";

interface DetailsItemProps {
  label: string;
  children: React.ReactNode;
}

export const DetailsItem: React.FC<DetailsItemProps> = ({ label, children }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{children}</span>
    </div>
  );
};
