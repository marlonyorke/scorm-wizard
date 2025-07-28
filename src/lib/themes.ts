/**
 * Thema definities en hulpfuncties
 * 
 * Dit bestand bevat alle thema-gerelateerde types, constanten en hulpfuncties
 * voor het themasysteem van de applicatie.
 */

// Type voor thema namen
export type ThemeName = "cosmic" | "cyberpunk" | "aurora" | "sunny" | "neon";

// Interface voor thema kleuren
export interface ThemeColors {
  // Achtergrond kleuren
  primaryBg: string;
  secondaryBg: string;
  
  // Accent kleuren
  primaryAccent: string;
  secondaryAccent: string;
  
  // Tekst kleuren
  primaryText: string;
  secondaryText: string;
  accentText: string;
  
  // Status kleuren
  success: string;
  warning: string;
  error: string;
  
  // Gradiënten
  primaryGradient: string;
  accentGradient: string;
}

// Interface voor een volledig thema
export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
  colors: ThemeColors;
  effects?: {
    glow?: string;
    animation?: string;
  };
}

/**
 * Thema definities
 */
export const themes: Record<ThemeName, Theme> = {
  // Kosmische Diepte thema - Volledig vernieuwd met diepe ruimte inspiratie
  cosmic: {
    name: "cosmic",
    label: "Kosmische Diepte",
    description: "Diepe ruimte met nevels en sterrenstelsels",
    colors: {
      // Achtergrond kleuren
      primaryBg: "#050A30", // Diepe ruimte blauw
      secondaryBg: "#000C66", // Nevelblauw
      
      // Accent kleuren
      primaryAccent: "#7B4DFF", // Kosmisch paars
      secondaryAccent: "#00FFCA", // Pulsar groen
      
      // Tekst kleuren
      primaryText: "#E6F1FF", // Sterrenlicht
      secondaryText: "#A9C2FF", // Nevelgloed
      accentText: "#C0A9FF", // Paarse gloed
      
      // Status kleuren
      success: "#00FFAA", // Alien groen
      warning: "#FFC700", // Supernova geel
      error: "#FF5C8D", // Rode dwerg
      
      // Gradiënten
      primaryGradient: "linear-gradient(135deg, #050A30 0%, #000C66 100%)",
      accentGradient: "linear-gradient(135deg, #7B4DFF 0%, #00FFCA 100%)",
    },
    effects: {
      glow: "0 0 25px rgba(123, 77, 255, 0.6)",
      animation: "cosmic-stars 20s linear infinite",
    },
  },
  
  // Cyberpunk Neon thema - Volledig vernieuwd met retro-futuristische stijl
  cyberpunk: {
    name: "cyberpunk",
    label: "Cyberpunk Neon",
    description: "Retro-futuristische neonstad in de regen",
    colors: {
      // Achtergrond kleuren
      primaryBg: "#0F0F12", // Nachtstad
      secondaryBg: "#1A1A24", // Verlaten gebouwen
      
      // Accent kleuren
      primaryAccent: "#FF2E6E", // Neon roze
      secondaryAccent: "#01FFC3", // Digitaal groen
      
      // Tekst kleuren
      primaryText: "#FFFFFF", // Holografisch wit
      secondaryText: "#8A8A9E", // Statisch grijs
      accentText: "#01FFC3", // Digitaal groen tekst
      
      // Status kleuren
      success: "#01FFC3", // Digitaal groen
      warning: "#FFDD00", // Waarschuwingsgeel
      error: "#FF2E6E", // Neon roze
      
      // Gradiënten
      primaryGradient: "linear-gradient(180deg, #0F0F12 0%, #1A1A24 100%)",
      accentGradient: "linear-gradient(90deg, #FF2E6E 0%, #01FFC3 100%)",
    },
    effects: {
      glow: "0 0 20px rgba(255, 46, 110, 0.7)",
      animation: "neon-flicker 2s ease-in-out infinite",
    },
  },
  
  // Noorderlicht thema - Volledig vernieuwd met ijslandschap inspiratie
  aurora: {
    name: "aurora",
    label: "Noorderlicht",
    description: "IJslandschap onder een dansend noorderlicht",
    colors: {
      // Achtergrond kleuren
      primaryBg: "#0B1437", // Poolnacht
      secondaryBg: "#162447", // IJsgrot
      
      // Accent kleuren
      primaryAccent: "#4CC9F0", // IJsblauw
      secondaryAccent: "#7209B7", // Noorderlicht paars
      
      // Tekst kleuren
      primaryText: "#F8F9FA", // Sneeuwwit
      secondaryText: "#B8C5D6", // IJsgrijs
      accentText: "#BDE0FE", // Lichtblauw
      
      // Status kleuren
      success: "#8EECF5", // Gletsjer blauw
      warning: "#FFC8DD", // Zacht roze
      error: "#F72585", // Levendig roze
      
      // Gradiënten
      primaryGradient: "linear-gradient(135deg, #0B1437 0%, #162447 100%)",
      accentGradient: "linear-gradient(135deg, #4CC9F0 0%, #7209B7 100%)",
    },
    effects: {
      glow: "0 0 30px rgba(76, 201, 240, 0.3)",
      animation: "aurora-waves 15s ease infinite",
    },
  },
  
  // Zonnig Daglicht thema - Volledig vernieuwd met tropische inspiratie
  sunny: {
    name: "sunny",
    label: "Tropisch Paradijs",
    description: "Zonnig tropisch strand met palmbomen",
    colors: {
      // Achtergrond kleuren
      primaryBg: "#F9F9F1", // Zandstrand
      secondaryBg: "#F0F4E3", // Palmbladeren
      
      // Accent kleuren
      primaryAccent: "#FF9F1C", // Zonsondergang oranje
      secondaryAccent: "#2EC4B6", // Tropisch water
      
      // Tekst kleuren
      primaryText: "#011627", // Diep oceaanblauw
      secondaryText: "#607466", // Palmboom grijs
      accentText: "#E71D36", // Hibiscus rood
      
      // Status kleuren
      success: "#2EC4B6", // Tropisch water
      warning: "#FFBF69", // Zacht oranje
      error: "#E71D36", // Hibiscus rood
      
      // Gradiënten
      primaryGradient: "linear-gradient(135deg, #F9F9F1 0%, #F0F4E3 100%)",
      accentGradient: "linear-gradient(135deg, #FF9F1C 0%, #2EC4B6 100%)",
    },
    effects: {
      glow: "0 0 15px rgba(255, 159, 28, 0.3)",
      animation: "ocean-waves 10s ease-in-out infinite",
    },
  },
  
  // Neon thema - Futuristisch design met gloeiende accenten
  neon: {
    name: "neon",
    label: "Futuristisch Neon",
    description: "Futuristisch design met gloeiende neon accenten",
    colors: {
      // Achtergrond kleuren
      primaryBg: "#0c0032", // Diep paars-blauw
      secondaryBg: "#190061", // Donker paars
      
      // Accent kleuren
      primaryAccent: "#7b2ff7", // Neon paars
      secondaryAccent: "#00f2ff", // Neon cyaan
      
      // Tekst kleuren
      primaryText: "#ffffff", // Helder wit
      secondaryText: "#c8c6e7", // Licht paars
      accentText: "#00f2ff", // Neon cyaan
      
      // Status kleuren
      success: "#00f2ff", // Neon cyaan
      warning: "#9d4edd", // Paars
      error: "#ff0055", // Neon roze
      
      // Gradiënten
      primaryGradient: "linear-gradient(135deg, #0c0032 0%, #190061 100%)",
      accentGradient: "linear-gradient(135deg, #7b2ff7 0%, #00f2ff 100%)",
    },
    effects: {
      glow: "0 0 20px rgba(0, 242, 255, 0.5)",
      animation: "neon-pulse 2s ease-in-out infinite",
    },
  },
};

/**
 * Haalt een thema op op basis van de naam
 * @param themeName De naam van het thema
 * @returns Het thema object of het standaard thema als het niet gevonden wordt
 */
export function getTheme(themeName: ThemeName): Theme {
  return themes[themeName] || themes.cosmic;
}

/**
 * Haalt de CSS-variabele op voor een specifieke eigenschap in het huidige thema
 * @param property De CSS-variabele naam zonder '--' prefix
 * @returns De waarde van de CSS-variabele
 */
export function getThemeVar(property: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${property}`).trim();
}

/**
 * Controleert of het thema correct is toegepast
 * @param themeName De naam van het thema om te controleren
 * @returns True als het thema correct is toegepast, anders false
 */
export function isThemeApplied(themeName: ThemeName): boolean {
  return document.documentElement.classList.contains(`theme-${themeName}`);
}
