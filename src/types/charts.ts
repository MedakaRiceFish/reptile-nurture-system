
export interface SensorChartData {
  timestamp: number;
  value: number;
  time: string;
}

export interface SensorChartProps {
  data: SensorChartData[];
  type: 'temperature' | 'humidity';
  unit: string;
}
