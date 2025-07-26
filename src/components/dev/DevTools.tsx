import React from "react";

import MockServiceToggle from "./MockServiceToggle";

/**
 * Component dat ontwikkelingstools bevat die alleen in development mode worden weergegeven
 */
export function DevTools() {
  // Controleer of we in development mode zijn
  const isDevelopment = process.env.NODE_ENV === "development";
  
  // Niet renderen in productie
  if (!isDevelopment) {
    return null;
  }
  
  return (
    <>
      <MockServiceToggle />
    </>
  );
}

export default DevTools;
