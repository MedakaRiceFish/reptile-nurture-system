
import { Animal } from "@/services/animalService";

export type WeightRecord = {
  id?: string;
  date: string;
  weight: number;
};

export type AnimalNote = {
  date: string;
  note: string;
};

export type AnimalWithWeightHistory = Animal & {
  weightHistory?: WeightRecord[];
};
