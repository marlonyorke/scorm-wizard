import { SCORM_ERROR_CODES } from "./constants";

export const validateScore = (score: string): boolean => {
  const numScore = parseInt(score);
  return !isNaN(numScore) && numScore >= 0 && numScore <= 100;
};

export const validateStatus = (status: string): boolean => {
  return ["not attempted", "incomplete", "completed", "failed", "passed"].includes(status);
};

export const getErrorCode = (error: string): string => {
  return Object.entries(SCORM_ERROR_CODES).find(([_, value]) => value === error)?.[0] || "UNKNOWN_ERROR";
};