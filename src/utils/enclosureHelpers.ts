
export const getRandomPlaceholderImage = () => {
  const images = [
    "https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1438565434616-3ef039228b15?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=800&auto=format&fit=crop&q=60"
  ];
  return images[Math.floor(Math.random() * images.length)];
};

export const getTemperatureColor = (temp: number) => {
  if (temp > 90) return "text-red-500";
  if (temp < 70) return "text-blue-500";
  return "text-reptile-500";
};

export const getHumidityColor = (hum: number) => {
  if (hum > 80) return "text-blue-500";
  if (hum < 40) return "text-amber-500";
  return "text-reptile-500";
};

// Initial enclosure data (fallback when no DB data available)
export const INITIAL_ENCLOSURE_DATA = [
  {
    id: "sample-1",
    name: "Gargoyle Gecko Enclosure",
    temperature: 78,
    humidity: 65,
    light: 120,
    pressure: 1013,
    image: "https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=800&auto=format&fit=crop&q=60",
    readingStatus: "Active"
  },
  {
    id: "sample-2",
    name: "Bearded Dragon Habitat",
    temperature: 92,
    humidity: 35,
    light: 250,
    pressure: 1012,
    image: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=800&auto=format&fit=crop&q=60",
    readingStatus: "Active"
  },
  {
    id: "sample-3",
    name: "Ball Python Terrarium",
    temperature: 82,
    humidity: 60,
    light: 80,
    pressure: 1013,
    image: "https://images.unsplash.com/photo-1438565434616-3ef039228b15?w=800&auto=format&fit=crop&q=60",
    readingStatus: "Active"
  },
  {
    id: "sample-4",
    name: "Leopard Gecko Home",
    temperature: 80,
    humidity: 45,
    light: 110,
    pressure: 1012,
    image: "https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=800&auto=format&fit=crop&q=60",
    readingStatus: "Active"
  },
];
