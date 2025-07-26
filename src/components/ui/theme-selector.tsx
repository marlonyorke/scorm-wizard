import { Palette } from "lucide-react";
import React, { useState, useEffect } from "react";

import { Button } from "./button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

import type { ThemeName} from "@/lib/themes";
import { themes, getTheme } from "@/lib/themes";

interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  className = "",
}) => {
  const [activeTheme, setActiveTheme] = useState<ThemeName>("futuristic");

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeName | null;
    if (savedTheme && Object.keys(themes).includes(savedTheme)) {
      setActiveTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to futuristic theme if none is set
      setActiveTheme("futuristic");
      applyTheme("futuristic");
    }
  }, []);

  const applyTheme = (themeName: ThemeName) => {
    // Remove all theme classes
    Object.keys(themes).forEach((theme) => {
      document.documentElement.classList.remove(`theme-${theme}`);
    });
    
    // Add the selected theme class
    document.documentElement.classList.add(`theme-${themeName}`);
    
    // Apply CSS variables
    const theme = getTheme(themeName);
    
    document.documentElement.style.setProperty("--primary-bg", theme.colors.primaryBg);
    document.documentElement.style.setProperty("--secondary-bg", theme.colors.secondaryBg);
    document.documentElement.style.setProperty("--primary-accent", theme.colors.primaryAccent);
    document.documentElement.style.setProperty("--secondary-accent", theme.colors.secondaryAccent);
    document.documentElement.style.setProperty("--primary-text", theme.colors.primaryText);
    document.documentElement.style.setProperty("--secondary-text", theme.colors.secondaryText);
    document.documentElement.style.setProperty("--accent-text", theme.colors.accentText);
    document.documentElement.style.setProperty("--success", theme.colors.success);
    document.documentElement.style.setProperty("--warning", theme.colors.warning);
    document.documentElement.style.setProperty("--error", theme.colors.error);
    document.documentElement.style.setProperty("--primary-gradient", theme.colors.primaryGradient);
    document.documentElement.style.setProperty("--accent-gradient", theme.colors.accentGradient);
    
    // Save to localStorage
    localStorage.setItem("theme", themeName);
  };

  const handleThemeChange = (themeName: ThemeName) => {
    setActiveTheme(themeName);
    applyTheme(themeName);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full ${className}`}
          aria-label="Verander thema"
        >
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.values(themes).map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => handleThemeChange(theme.name)}
            className={activeTheme === theme.name ? "bg-accent text-accent-foreground" : ""}
          >
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ 
                  background: theme.colors.primaryAccent,
                  boxShadow: theme.effects?.glow,
                }}
              />
              {theme.label}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
