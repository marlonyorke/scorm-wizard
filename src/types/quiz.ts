import type { EducationLevel } from "./education";

export interface Quiz {
  id: string;
  title: string;
  level: EducationLevel;
  year: number;
  subjectId: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "published";
}