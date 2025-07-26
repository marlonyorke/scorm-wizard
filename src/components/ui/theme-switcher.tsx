import { Moon, Sun, Zap } from "lucide-react";
import React from "react";

import { Button } from "./button";

import { useTheme } from "@/contexts/ThemeContext";

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  className = "",
}) => {
  const { theme, toggleTheme } = useTheme();

  // Bepaal het juiste icoon en aria-label op basis van het huidige thema
  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5" />;
      case "dark":
        return <Moon className="h-5 w-5" />;
      case "neon":
        return <Zap className="h-5 w-5 text-neon-highlight animate-neon-pulse" />;
      default:
        return <Sun className="h-5 w-5" />;
    }
  };

  const getAriaLabel = () => {
    switch (theme) {
      case "light":
        return "Schakel naar donker thema";
      case "dark":
        return "Schakel naar neon thema";
      case "neon":
        return "Schakel naar licht thema";
      default:
        return "Schakel thema";
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`rounded-full ${className} ${theme === "neon" ? "bg-opacity-20 bg-neon-highlight shadow-neon-glow" : ""}`}
      aria-label={getAriaLabel()}
    >
      {getThemeIcon()}
    </Button>
  );
};
