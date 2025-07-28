import { AlertTriangle, X } from "lucide-react";
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import mockConfig, { MockableService } from "@/config/mock-config";

/**
 * Component voor het in- en uitschakelen van mock services tijdens ontwikkeling
 */
export function MockServiceToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [mockEnabled, setMockEnabled] = useState(false);
  const [serviceStates, setServiceStates] = useState<Record<MockableService, boolean>>({} as Record<MockableService, boolean>);
  
  // Laad de huidige configuratie bij initialisatie
  useEffect(() => {
    updateStateFromConfig();
  }, []);
  
  // Update de lokale state op basis van de huidige configuratie
  const updateStateFromConfig = () => {
    const config = mockConfig.getConfig();
    setMockEnabled(config.enabled);
    
    // Initialiseer de service states
    const states = {} as Record<MockableService, boolean>;
    Object.values(MockableService).forEach((service) => {
      states[service] = config.services[service] || false;
    });
    setServiceStates(states);
  };
  
  // Schakel alle mock services in of uit
  const handleToggleAll = (enabled: boolean) => {
    if (enabled) {
      mockConfig.enableAll(false);
    } else {
      mockConfig.disableAll();
    }
    updateStateFromConfig();
  };
  
  // Schakel een specifieke mock service in of uit
  const handleToggleService = (service: MockableService, enabled: boolean) => {
    if (enabled) {
      mockConfig.enable(service, false);
    } else {
      mockConfig.disable(service);
    }
    updateStateFromConfig();
  };
  
  // Render een knop om de mock services te openen
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 bg-gray-100 hover:bg-gray-200 text-gray-800 z-50"
        onClick={() => setIsOpen(true)}
      >
        Mock Services
      </Button>
    );
  }
  
  return (
    <Card className="fixed bottom-4 left-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Mock Services</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Schakel mock services in of uit voor ontwikkeling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <Label htmlFor="mock-all" className="font-semibold">Alle Mock Services</Label>
          </div>
          <Switch
            id="mock-all"
            checked={mockEnabled}
            onCheckedChange={handleToggleAll}
          />
        </div>
        
        <div className="mt-2 space-y-2">
          {Object.values(MockableService).map((service) => (
            <div key={service} className="flex items-center justify-between py-1 pl-6">
              <Label htmlFor={`mock-${service}`}>{service}</Label>
              <Switch
                id={`mock-${service}`}
                checked={serviceStates[service] || false}
                onCheckedChange={(checked) => handleToggleService(service, checked)}
                disabled={!mockEnabled}
              />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-gray-500">
        <p>Mock services worden alleen gebruikt tijdens ontwikkeling en testen.</p>
      </CardFooter>
    </Card>
  );
}

export default MockServiceToggle;
