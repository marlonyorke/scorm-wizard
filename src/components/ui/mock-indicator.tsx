import { AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

import type { MockableService } from "@/config/mock-config";
import mockConfig from "@/config/mock-config";

/**
 * Component dat een visuele indicator toont wanneer mock services actief zijn
 */
export function MockIndicator() {
  const [isMockActive, setIsMockActive] = useState<boolean>(false);
  const [mockedServices, setMockedServices] = useState<MockableService[]>([]);
  
  // Check elke seconde of de mock status is veranderd
  useEffect(() => {
    const checkMockStatus = () => {
      const config = mockConfig.getConfig();
      
      // Alleen tonen als mock is ingeschakeld en niet in test-modus
      if (config.enabled && !config.testOnly) {
        // Bepaal welke services gemocked zijn
        const activeServices = Object.entries(config.services)
          .filter(([_, isEnabled]) => isEnabled)
          .map(([service]) => service as MockableService);
        
        setIsMockActive(true);
        setMockedServices(activeServices);
      } else {
        setIsMockActive(false);
        setMockedServices([]);
      }
    };
    
    // Initiële check
    checkMockStatus();
    
    // Periodieke check
    const interval = setInterval(checkMockStatus, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Niet renderen als mock niet actief is of in test-modus
  if (!isMockActive) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-4 py-2 rounded-md shadow-lg z-50 flex items-center gap-2">
      <AlertCircle className="w-5 h-5 text-yellow-600" />
      <div>
        <p className="font-semibold">Mock Modus Actief</p>
        <p className="text-xs">
          Actieve services: {mockedServices.join(", ")}
        </p>
        <button 
          className="text-xs underline text-blue-600 hover:text-blue-800"
          onClick={() => mockConfig.disableAll()}
        >
          Uitschakelen
        </button>
      </div>
    </div>
  );
}

export default MockIndicator;
