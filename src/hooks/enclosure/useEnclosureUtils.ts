
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

export const getStatusColor = (status: string) => {
  if (status === "online") return "bg-green-500";
  if (status === "warning") return "bg-amber-500";
  return "bg-red-500";
};
