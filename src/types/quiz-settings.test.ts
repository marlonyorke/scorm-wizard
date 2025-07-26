import { describe, it, expect } from "vitest";

import type { EducationLevel } from "./education";
import { validateQuizSettings, isValidYear } from "./quiz-settings";

describe("isValidYear", () => {
  it("should validate MAVO years correctly", () => {
    expect(isValidYear("MAVO", 1)).toBe(true);
    expect(isValidYear("MAVO", 4)).toBe(true);
    expect(isValidYear("MAVO", 5)).toBe(false);
    expect(isValidYear("MAVO", 0)).toBe(false);
  });

  it("should validate HAVO years correctly", () => {
    expect(isValidYear("HAVO", 1)).toBe(true);
    expect(isValidYear("HAVO", 5)).toBe(true);
    expect(isValidYear("HAVO", 6)).toBe(false);
    expect(isValidYear("HAVO", 0)).toBe(false);
  });

  it("should validate VWO years correctly", () => {
    expect(isValidYear("VWO", 1)).toBe(true);
    expect(isValidYear("VWO", 6)).toBe(true);
    expect(isValidYear("VWO", 7)).toBe(false);
    expect(isValidYear("VWO", 0)).toBe(false);
  });
});

describe("validateQuizSettings", () => {
  it("should validate education level", () => {
    expect(validateQuizSettings({ level: "MAVO" })).toHaveLength(0);
    expect(validateQuizSettings({ level: "HAVO" })).toHaveLength(0);
    expect(validateQuizSettings({ level: "VWO" })).toHaveLength(0);
    expect(validateQuizSettings({ level: "INVALID" as EducationLevel })).toHaveLength(1);
  });

  it("should validate year based on education level", () => {
    expect(validateQuizSettings({ level: "MAVO", year: 4 })).toHaveLength(0);
    expect(validateQuizSettings({ level: "MAVO", year: 5 })).toHaveLength(1);
    expect(validateQuizSettings({ level: "HAVO", year: 5 })).toHaveLength(0);
    expect(validateQuizSettings({ level: "HAVO", year: 6 })).toHaveLength(1);
    expect(validateQuizSettings({ level: "VWO", year: 6 })).toHaveLength(0);
    expect(validateQuizSettings({ level: "VWO", year: 7 })).toHaveLength(1);
  });

  it("should validate subjectId", () => {
    expect(validateQuizSettings({ subjectId: "math" })).toHaveLength(0);
    expect(validateQuizSettings({ subjectId: "" })).toHaveLength(0);
    expect(validateQuizSettings({ subjectId: null })).toHaveLength(0);
  });

  it("should validate multiple fields at once", () => {
    const validSettings = {
      level: "HAVO" as EducationLevel,
      year: 4,
      subjectId: "math",
    };
    expect(validateQuizSettings(validSettings)).toHaveLength(0);

    const invalidSettings = {
      level: "MAVO" as EducationLevel,
      year: 6,
      subjectId: "math",
    };
    expect(validateQuizSettings(invalidSettings)).toHaveLength(1);
  });
});