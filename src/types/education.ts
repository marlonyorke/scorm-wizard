export type EducationLevel = "MAVO" | "HAVO" | "VWO";

export interface SchoolYear {
  level: EducationLevel;
  year: number;
}

export interface Subject {
  id: string;
  name: string;
  availableLevels: EducationLevel[];
}