import type { SCORMAPI } from "@/utils/scormAPI";

declare global {
  interface Window {
    API?: SCORMAPI;
  }
}