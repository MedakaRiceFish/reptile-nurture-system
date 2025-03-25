
export interface Enclosure {
  id: string | number;
  name: string;
  temperature: number;
  humidity: number;
  light: number;
  pressure: number;
  image?: string;
  readingStatus?: string;
}

export interface EnclosureListProps {
  viewMode?: "grid" | "list";
}

export interface EnclosureViewProps {
  enclosures: Enclosure[];
  handleEnclosureClick: (id: string | number) => void;
  handleUpdateValues: (id: string | number, values: { temperature: number; humidity: number }) => void;
  getTemperatureColor: (temp: number) => string;
  getHumidityColor: (hum: number) => string;
}
