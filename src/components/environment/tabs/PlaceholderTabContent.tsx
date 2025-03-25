
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface PlaceholderTabContentProps {
  title?: string;
  description?: string;
}

export const PlaceholderTabContent: React.FC<PlaceholderTabContentProps> = ({ 
  title = "Environment Data",
  description = "Data for this tab will be available soon"
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-12">
          This feature is under development.
        </p>
      </CardContent>
    </Card>
  );
};
