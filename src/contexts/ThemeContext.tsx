import React, { createContext, useContext, useState, useEffect } from "react";

// Definieer de types voor de thema context
export type ThemeType = "light" | "neon";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

// Creëer de context met een default waarde
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

// Custom hook om de thema context te gebruiken
export const useTheme = () => useContext(ThemeContext);

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Haal het thema op uit localStorage of gebruik 'light' als default
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as ThemeType) || "light";
  });

  // Effect om het thema toe te passen op het document element
  useEffect(() => {
    const root = document.documentElement;
    
    // Verwijder alle bestaande thema klassen
    root.classList.remove("light-mode", "theme-neon");
    
    // Voeg de juiste thema klasse toe
    if (theme === "neon") {
      root.classList.add("theme-neon");
      document.body.classList.add("theme-neon");
      document.body.classList.remove("light");
    } else {
      root.classList.add("light-mode");
      document.body.classList.add("light");
      document.body.classList.remove("theme-neon");
    }
    
    // Sla het thema op in localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Functie om het thema te wisselen tussen light en neon
  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      if (prevTheme === "light") {
        return "neon";
      }
      return "light";
    });
  };

  // Functie om een specifiek thema in te stellen
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

// ThemeInitializer component om de thema toe te passen bij app start
export const ThemeInitializer: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    
    // Verwijder alle bestaande thema klassen
    root.classList.remove("light-mode", "theme-neon");
    
    // Voeg de juiste thema klasse toe
    if (theme === "neon") {
      root.classList.add("theme-neon");
      document.body.classList.add("theme-neon");
      document.body.classList.remove("light");
    } else {
      root.classList.add("light-mode");
      document.body.classList.add("light");
      document.body.classList.remove("theme-neon");
    }
  }, [theme]);

  return null;
};
