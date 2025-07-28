import React, { createContext, useContext } from "react";

import { useScormState } from "./hooks/useScormState";
import type { ScormContextType } from "./types/scorm";

const ScormContext = createContext<ScormContextType | undefined>(undefined);

export const ScormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scormState = useScormState();

  return (
    <ScormContext.Provider value={scormState}>
      {children}
    </ScormContext.Provider>
  );
};

export const useScorm = () => {
  const context = useContext(ScormContext);
  if (context === undefined) {
    throw new Error("useScorm must be used within a ScormProvider");
  }
  return context;
};