import { ArrowRight, Check, Package } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeDebug } from "@/components/ui/theme-debug";

// Vraagtype definities - alleen geïmplementeerde vraagtypes
const questionTypes = [
  {
    id: "multiple-choice",
    title: "Multiple Choice",
    description: "Maak een vraag met meerdere antwoordopties waarvan één of meerdere correct zijn.",
    icon: "📝",
  },
  {
    id: "drag-drop",
    title: "Drag and Drop",
    description: "Maak een vraag waarbij de gebruiker items naar de juiste plaats moet slepen.",
    icon: "🔄",
  },
  {
    id: "matching",
    title: "Matching",
    description: "Maak een vraag waarbij de gebruiker items moet koppelen aan de juiste tegenhangers.",
    icon: "🔗",
  },
  {
    id: "hotspot",
    title: "Hotspot",
    description: "Maak een vraag waarbij de gebruiker op de juiste plek(ken) in een afbeelding moet klikken.",
    icon: "🎯",
  },
  {
    id: "open",
    title: "Open Vraag",
    description: "Maak een open vraag waarbij de gebruiker een tekst moet schrijven.",
    icon: "📄",
  },
  {
    id: "order",
    title: "Volgorde",
    description: "Maak een vraag waarbij de gebruiker items in de juiste volgorde moet plaatsen.",
    icon: "📊",
  },
  {
    id: "mark-words",
    title: "Mark the Words",
    description: "Maak een vraag waarbij de gebruiker specifieke woorden in een tekst moet markeren.",
    icon: "🔍",
  },
  {
    id: "video-interactive",
    title: "Interactieve Video",
    description: "Maak een interactieve video met geïntegreerde vragen op specifieke tijdstippen.",
    icon: "🎬",
  },
];

export default function QuestionTypeSelection() {
  const navigate = useNavigate();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(typeId)) {
        return prev.filter((id) => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const handleGoToEditor = () => {
    if (selectedTypes.length > 0) {
      // Sla de geselecteerde types op in localStorage zodat de editor pagina ze kan ophalen
      localStorage.setItem("editor_selected_types", JSON.stringify(selectedTypes));
      
      // Gebruik window.location.href om een volledige pagina refresh te forceren
      window.location.href = "/editor";
    }
  };



  const handleGoToScormPreview = () => {
    // Navigeer naar de SCORM preview pagina
    navigate("/scorm");
  };

  return (
    <div className="min-h-screen bg-primary-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-end items-center mb-8">
          {/* ThemeSwitcher removed: now only global in App.tsx */}
        </div>
        
        {/* Titel */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-primary-text mb-2">SCORM Wizard</h1>
          <p className="text-secondary-text">Selecteer de types vragen die je wilt gebruiken in je interactieve video</p>
        </div>
        
        {/* Grid met vraagtypes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {questionTypes.map((type) => (
            <Card 
              key={type.id} 
              className={`bg-secondary-bg border-2 transition-all duration-300 cursor-pointer relative ${
                selectedTypes.includes(type.id) 
                  ? "border-[#00ff00] ring-2 ring-[#00ff00] ring-offset-2 ring-offset-[#0a0a0a] shadow-lg shadow-[#00ff00]/50 scale-105 selected-card" 
                  : "border-[#333333] hover:border-[#00ff00]/80 hover:shadow-md hover:shadow-[#00ff00]/40"
              }`}
              onClick={() => handleTypeToggle(type.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-primary-text">{type.title}</CardTitle>
                      {(type.id === "multiple-choice" || type.id === "mark-words" || type.id === "order" || type.id === "matching") && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md animate-pulse">
                          AI Powered ✨
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{type.icon}</span>
                    {selectedTypes.includes(type.id) && (
                      <div className="w-6 h-6 rounded-full bg-primary-accent flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <CardDescription className="text-secondary-text">{type.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Knoppen voor navigatie */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
          <Button 
            onClick={handleGoToEditor} 
            className="px-8 py-2 bg-primary-accent hover:bg-opacity-90 text-primary-text flex items-center gap-2"
            disabled={selectedTypes.length === 0}
          >
            <span>Ga naar de editor</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          

          <Button 
            onClick={handleGoToScormPreview} 
            variant="secondary"
            className="px-8 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            <span>SCORM Preview</span>
          </Button>
        </div>
      </div>
      
      {/* ThemeDebug component */}
      <ThemeDebug />
    </div>
  );
}
