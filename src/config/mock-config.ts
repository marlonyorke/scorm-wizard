/**
 * Configuratie voor mock services
 * 
 * Dit bestand bevat instellingen voor het in- en uitschakelen van mock services
 * voor verschillende API-integraties in de applicatie.
 */

// Enum voor de verschillende API-services die gemocked kunnen worden
export enum MockableService {
  OPENAI = "openai",
  SCORM_EXPORT = "scorm-export",
  // Voeg hier andere services toe indien nodig
}

// Interface voor de mock configuratie
export interface MockConfig {
  // Geeft aan of de mock-modus globaal is ingeschakeld
  enabled: boolean;
  
  // Specifieke services die gemocked moeten worden
  services: {
    [key in MockableService]?: boolean;
  };
  
  // Geeft aan of de mock-modus alleen voor testen is (niet zichtbaar in UI)
  testOnly: boolean;
}

// Standaard configuratie (mock uitgeschakeld)
const defaultConfig: MockConfig = {
  enabled: false,
  services: {
    [MockableService.OPENAI]: false,
    [MockableService.SCORM_EXPORT]: false,
  },
  testOnly: false,
};

// Huidige configuratie (begint met de standaard configuratie)
let currentConfig: MockConfig = { ...defaultConfig };

/**
 * Mock service configuratie
 */
export const mockConfig = {
  /**
   * Huidige configuratie ophalen
   */
  getConfig(): MockConfig {
    return { ...currentConfig };
  },
  
  /**
   * Controleren of een specifieke service gemocked moet worden
   * @param service De service om te controleren
   * @returns True als de service gemocked moet worden, anders false
   */
  isMocked(service: MockableService): boolean {
    return currentConfig.enabled && (currentConfig.services[service] === true);
  },
  
  /**
   * Alle mock services inschakelen
   * @param testOnly Geeft aan of de mock-modus alleen voor testen is
   */
  enableAll(testOnly: boolean = false): void {
    currentConfig = {
      enabled: true,
      services: Object.values(MockableService).reduce((acc, service) => {
        acc[service] = true;
        return acc;
      }, {} as Record<MockableService, boolean>),
      testOnly,
    };
  },
  
  /**
   * Specifieke mock service inschakelen
   * @param service De service om in te schakelen
   * @param testOnly Geeft aan of de mock-modus alleen voor testen is
   */
  enable(service: MockableService, testOnly: boolean = false): void {
    currentConfig = {
      ...currentConfig,
      enabled: true,
      services: {
        ...currentConfig.services,
        [service]: true,
      },
      testOnly,
    };
  },
  
  /**
   * Alle mock services uitschakelen
   */
  disableAll(): void {
    currentConfig = { ...defaultConfig };
  },
  
  /**
   * Specifieke mock service uitschakelen
   * @param service De service om uit te schakelen
   */
  disable(service: MockableService): void {
    currentConfig = {
      ...currentConfig,
      services: {
        ...currentConfig.services,
        [service]: false,
      },
    };
    
    // Als alle services zijn uitgeschakeld, schakel dan ook de globale mock-modus uit
    const anyServiceEnabled = Object.values(currentConfig.services).some((enabled) => enabled);
    if (!anyServiceEnabled) {
      currentConfig.enabled = false;
    }
  },
  
  /**
   * Reset de configuratie naar de standaardwaarden
   */
  reset(): void {
    currentConfig = { ...defaultConfig };
  },
  
  /**
   * Controleren of de mock-modus alleen voor testen is
   */
  isTestOnly(): boolean {
    return currentConfig.testOnly;
  },
};

export default mockConfig;
