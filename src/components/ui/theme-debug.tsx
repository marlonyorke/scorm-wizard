import { X, Info } from "lucide-react";
import React, { useState, useEffect } from "react";

import { useTheme } from "@/contexts/ThemeContext";

export const ThemeDebug: React.FC = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [cssVars, setCssVars] = useState<Record<string, string>>({});

  // Haal alle CSS-variabelen op voor het huidige thema
  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const vars: Record<string, string> = {};
    
    // Lijst van CSS-variabelen die we willen tonen
    const varNames = [
      "--primary-bg",
      "--secondary-bg",
      "--primary-accent",
      "--secondary-accent",
      "--primary-text",
      "--secondary-text",
      "--accent-text",
      "--success",
      "--warning",
      "--error",
      "--primary-gradient",
      "--accent-gradient",
      "--glow-effect",
      "--border-color",
      "--input-color",
      "--ring-color",
      "--radius",
      "--transition-speed",
      "--transition-easing",
    ];
    
    // Haal de waarden op voor elke variabele
    varNames.forEach((name) => {
      vars[name] = rootStyles.getPropertyValue(name).trim();
    });
    
    setCssVars(vars);
  }, [theme]);

  // Controleer of het thema correct is toegepast
  const documentThemeClass = document.documentElement.classList.contains(`theme-${theme}`);
  const bodyHasCorrectBg = document.body.style.backgroundColor === getComputedStyle(document.documentElement).getPropertyValue("--primary-bg");

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-2 bg-secondary-bg rounded-full shadow-lg z-50"
        aria-label="Toon thema debug informatie"
      >
        <Info className="w-5 h-5 text-primary-accent" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-[80vh] overflow-auto bg-secondary-bg rounded-lg shadow-lg border border-border z-50">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-sm font-medium text-primary-text">Thema Debug</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-md hover:bg-primary-bg"
          aria-label="Sluit debug panel"
        >
          <X className="w-5 h-5 text-secondary-text" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-secondary-text uppercase mb-2">Thema Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-text">Actief Thema:</span>
              <span className="text-sm font-medium text-primary-text">{theme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-text">HTML Class:</span>
              <span className={`text-sm font-medium ${documentThemeClass ? "text-success" : "text-error"}`}>
                {documentThemeClass ? "Correct" : "Ontbreekt"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-text">Body Achtergrond:</span>
              <span className={`text-sm font-medium ${bodyHasCorrectBg ? "text-success" : "text-error"}`}>
                {bodyHasCorrectBg ? "Correct" : "Onjuist"}
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-semibold text-secondary-text uppercase mb-2">CSS Variabelen</h4>
          <div className="space-y-2">
            {Object.entries(cssVars).map(([name, value]) => (
              <div key={name} className="flex flex-col">
                <span className="text-xs text-secondary-text">{name}:</span>
                <div className="flex items-center gap-2">
                  {value.startsWith("#") || value.startsWith("rgb") || value.startsWith("linear-gradient") ? (
                    <div 
                      className="w-6 h-6 rounded border border-border" 
                      style={{ background: value }}
                    />
                  ) : null}
                  <span className="text-xs font-mono text-primary-text overflow-hidden text-ellipsis">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
