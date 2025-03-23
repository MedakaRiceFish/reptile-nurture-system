
import React, { useState } from "react";
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Legend,
  Tooltip
} from "recharts";
import { format, parseISO } from "date-fns";
import { ANIMALS_DATA } from "@/data/animalsData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function WeightTrendsChart() {
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>(
    ANIMALS_DATA.slice(0, 3).map(animal => animal.id.toString())
  );

  const toggleAnimal = (animalId: string) => {
    if (selectedAnimals.includes(animalId)) {
      setSelectedAnimals(selectedAnimals.filter(id => id !== animalId));
    } else {
      setSelectedAnimals([...selectedAnimals, animalId]);
    }
  };

  // Get all unique dates from all animals
  const allDates = ANIMALS_DATA.flatMap(animal => 
    animal.weightHistory.map(record => record.date)
  ).filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Create chart data with all animals and dates
  const chartData = allDates.map(date => {
    const dataPoint: any = { date };
    
    ANIMALS_DATA.forEach(animal => {
      const weightRecord = animal.weightHistory.find(record => record.date === date);
      if (weightRecord) {
        dataPoint[`animal_${animal.id}`] = weightRecord.weight;
        dataPoint[`name_${animal.id}`] = animal.name;
      }
    });
    
    return dataPoint;
  });

  // Generate a color based on animal ID for consistent coloring
  const getAnimalColor = (id: number) => {
    const colors = [
      "#16a34a", // green
      "#2563eb", // blue
      "#d97706", // amber
      "#7c3aed", // violet
      "#ef4444", // red
      "#06b6d4", // cyan
    ];
    return colors[id % colors.length];
  };

  // Create chart config for selected animals
  const chartConfig = ANIMALS_DATA.reduce((config, animal) => {
    config[`animal_${animal.id}`] = {
      label: animal.name,
      color: getAnimalColor(animal.id),
    };
    return config;
  }, {} as any);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {ANIMALS_DATA.map(animal => (
          <button
            key={animal.id}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedAnimals.includes(animal.id.toString())
                ? `bg-[${getAnimalColor(animal.id)}] text-white`
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
            style={{
              backgroundColor: selectedAnimals.includes(animal.id.toString()) 
                ? getAnimalColor(animal.id) 
                : "",
              color: selectedAnimals.includes(animal.id.toString()) ? "white" : ""
            }}
            onClick={() => toggleAnimal(animal.id.toString())}
          >
            {animal.name}
          </button>
        ))}
      </div>

      <div className="h-[400px]">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(parseISO(value), "MMM dd")}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickMargin={10}
                domain={["auto", "auto"]}
                label={{ value: "Weight (g)", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <p className="font-medium">{format(parseISO(label), "MMM d, yyyy")}</p>
                        <div className="mt-2 space-y-1">
                          {payload
                            .filter(p => p.value !== undefined && p.dataKey && typeof p.dataKey === 'string' && p.dataKey.startsWith("animal_"))
                            .map((entry, index) => {
                              const id = typeof entry.dataKey === 'string' ? entry.dataKey.split("_")[1] : '';
                              const name = chartData.find(d => d.date === label)?.[`name_${id}`];
                              return (
                                <div key={index} className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-sm">{name}: <span className="font-medium">{entry.value} g</span></span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              
              {ANIMALS_DATA.map(animal => (
                selectedAnimals.includes(animal.id.toString()) && (
                  <Line
                    key={animal.id}
                    type="monotone"
                    dataKey={`animal_${animal.id}`}
                    name={animal.name}
                    stroke={getAnimalColor(animal.id)}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    connectNulls
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
