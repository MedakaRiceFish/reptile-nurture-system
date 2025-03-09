
import React from "react";
import { EnvironmentCard } from "./EnvironmentCard";

const ENCLOSURE_DATA = [
  {
    id: 1,
    name: "Gargoyle Gecko Enclosure",
    temperature: 78,
    humidity: 65,
    light: 120,
    pressure: 1013,
  },
  {
    id: 2,
    name: "Bearded Dragon Habitat",
    temperature: 92,
    humidity: 35,
    light: 250,
    pressure: 1012,
  },
  {
    id: 3,
    name: "Ball Python Terrarium",
    temperature: 82,
    humidity: 60,
    light: 80,
    pressure: 1013,
  },
  {
    id: 4,
    name: "Leopard Gecko Home",
    temperature: 80,
    humidity: 45,
    light: 110,
    pressure: 1012,
  },
];

export function EnclosureList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Active Enclosures</h2>
        <button className="text-sm px-4 py-2 bg-reptile-50 text-reptile-600 rounded-lg font-medium hover:bg-reptile-100 transition-colors">
          + Add Enclosure
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ENCLOSURE_DATA.map((enclosure) => (
          <EnvironmentCard
            key={enclosure.id}
            enclosureName={enclosure.name}
            temperature={enclosure.temperature}
            humidity={enclosure.humidity}
            light={enclosure.light}
            pressure={enclosure.pressure}
          />
        ))}
      </div>
    </div>
  );
}
