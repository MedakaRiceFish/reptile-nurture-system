
import React from "react";
import { EnvironmentCard } from "./EnvironmentCard";
import { EnclosureViewProps } from "@/types/enclosure";

export function EnclosureGridView({ 
  enclosures, 
  handleEnclosureClick,
  handleUpdateValues
}: EnclosureViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {enclosures.map((enclosure) => (
          <div 
            key={enclosure.id} 
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <EnvironmentCard
              enclosureId={enclosure.id}
              enclosureName={enclosure.name}
              temperature={enclosure.temperature}
              humidity={enclosure.humidity}
              light={enclosure.light}
              pressure={enclosure.pressure}
              image={enclosure.image}
              onClick={() => handleEnclosureClick(enclosure.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
