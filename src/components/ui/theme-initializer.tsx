import { useEffect } from "react";

import { useTheme } from "@/contexts/ThemeContext";

export const ThemeInitializer = () => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Verwijder alle oude thema-klassen
    document.documentElement.classList.remove("theme-cosmic", "theme-cyberpunk", "theme-aurora", "theme-sunny");
    
    // Voeg de juiste mode toe
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
      document.documentElement.classList.remove("light-mode");
    } else {
      document.documentElement.classList.add("light-mode");
      document.documentElement.classList.remove("dark-mode");
    }

    console.log(`ThemeInitializer: ${isDarkMode ? "Dark" : "Light"} mode toegepast op document.`);
  }, [isDarkMode]);

  return null;
};
