
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Thermometer, Droplet } from "lucide-react";
import { EnclosureValueEditor } from "./EnclosureValueEditor";
import { EnclosureViewProps } from "@/types/enclosure";

export function EnclosureListView({ 
  enclosures, 
  handleEnclosureClick, 
  handleUpdateValues,
  getTemperatureColor,
  getHumidityColor
}: EnclosureViewProps) {
  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Enclosure Name</TableHead>
            <TableHead>Temperature</TableHead>
            <TableHead>Humidity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enclosures.map((enclosure) => (
            <TableRow 
              key={enclosure.id} 
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell 
                className="font-medium"
                onClick={() => handleEnclosureClick(enclosure.id)}
              >
                {enclosure.name}
              </TableCell>
              <TableCell 
                className={getTemperatureColor(enclosure.temperature)}
                onClick={() => handleEnclosureClick(enclosure.id)}
              >
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  {enclosure.temperature}°F
                </div>
              </TableCell>
              <TableCell 
                className={getHumidityColor(enclosure.humidity)}
                onClick={() => handleEnclosureClick(enclosure.id)}
              >
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4" />
                  {enclosure.humidity}%
                </div>
              </TableCell>
              <TableCell onClick={() => handleEnclosureClick(enclosure.id)}>
                <span className="text-xs px-2 py-0.5 bg-reptile-100 text-reptile-800 rounded-full">
                  {enclosure.readingStatus || "Active"}
                </span>
              </TableCell>
              <TableCell>
                <EnclosureValueEditor
                  enclosureId={enclosure.id}
                  enclosureName={enclosure.name}
                  currentTemperature={enclosure.temperature}
                  currentHumidity={enclosure.humidity}
                  onUpdate={handleUpdateValues}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
