
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Edit } from "lucide-react";

interface EnvironmentDetailsCardProps {
  enclosure: any;
  getStatusColor: (status: string) => string;
  onEditClick: () => void;
}

export const EnvironmentDetailsCard: React.FC<EnvironmentDetailsCardProps> = ({
  enclosure,
  getStatusColor,
  onEditClick
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <div className="flex items-center">
            <Leaf className="h-5 w-5 mr-2 text-muted-foreground" />
            Environment Details
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={onEditClick}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status:</span>
            <Badge className={`${getStatusColor(enclosure.readingStatus)} text-white`}>
              {enclosure.readingStatus === "online" ? "Online" : 
              enclosure.readingStatus === "warning" ? "Warning" : "Offline"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span>{enclosure.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Size:</span>
            <span>{enclosure.size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Substrate:</span>
            <span>{enclosure.substrate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plants:</span>
            <span>{enclosure.plants.join(", ")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
