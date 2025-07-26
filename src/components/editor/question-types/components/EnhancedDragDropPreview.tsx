import { Check, X } from "lucide-react";
import React, { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import type { DragDropItem, DragDropZone } from "@/types/editor";

interface DragDropQuestionPreviewProps {
  text: string;
  items: DragDropItem[];
  dropZones?: DragDropZone[];
  dropZoneSettings?: {
    allowMultipleItemsPerZone?: boolean;
    onlyAcceptCorrectItems?: boolean;
    returnItemsToOrigin?: boolean;
    highlightColor?: string;
    feedbackStyle?: "icon" | "color" | "text" | "all";
    animationType?: "fade" | "bounce" | "shake" | "none";
  };
  mediaUrl?: string;
  imageSize?: {
    width: number;
    height: number;
  };
}

interface ItemPlacement {
  itemId: string;
  zoneId: string;
}

export const EnhancedDragDropPreview = ({
  text,
  items,
  dropZones = [],
  dropZoneSettings,
  mediaUrl,
  imageSize,
}: DragDropQuestionPreviewProps) => {
  const [placements, setPlacements] = useState<ItemPlacement[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<{[key: string]: boolean}>({});
  const { theme } = useTheme();
  
  // Determine if we should use neon styling
  const isNeonTheme = theme === "neon";
  const isDarkTheme = theme === "dark";
  
  // Ensure we have valid arrays for items and dropZones
  const safeItems = Array.isArray(items) ? items : [];
  const safeDropZones = Array.isArray(dropZones) ? dropZones : [];
  
  // Default settings
  const settings = {
    allowMultipleItemsPerZone: false,
    onlyAcceptCorrectItems: false,
    returnItemsToOrigin: true,
    highlightColor: "hsl(45 100% 50% / 0.2)", // Primary color with opacity
    feedbackStyle: "all",
    animationType: "fade",
    ...dropZoneSettings,
  };
  
  // Reset the preview state when the question changes
  useEffect(() => {
    setPlacements([]);
    setDraggedItemId(null);
    setHoveredZoneId(null);
    setChecked(false);
    setResults({});
  }, [safeItems, safeDropZones]);

  // Classic HTML5 drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    // Set the data transfer
    e.dataTransfer.setData("text/plain", itemId);
    // Set ghost image if needed
    const target = e.currentTarget;
    e.dataTransfer.setDragImage(target, 20, 20);
    // Track which item is being dragged
    setDraggedItemId(itemId);
  };

  const handleDragEnd = () => {
    // Reset after drag operation is complete
    setDraggedItemId(null);
    setHoveredZoneId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, zoneId: string) => {
    // Prevent default to allow drop
    e.preventDefault();
    e.stopPropagation();
    // Show visual feedback for the current drop target
    setHoveredZoneId(zoneId);
  };

  const handleDragLeave = () => {
    // Reset hover state when leaving a drop target
    setHoveredZoneId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, zoneId: string) => {
    // Prevent default browser behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Get the dragged item ID
    const itemId = e.dataTransfer.getData("text/plain");
    if (!itemId) {
      return;
    }
    
    // Get the target zone
    const targetZone = safeDropZones.find((z) => z.id === zoneId);
    if (!targetZone) {
      return;
    }
    
    // If only correct items are accepted and this isn't correct or alternative
    if (settings.onlyAcceptCorrectItems) {
      const isCorrect = targetZone.correctItemId === itemId;
      const isAlternative = targetZone.alternativeAnswers?.some((a) => a.itemId === itemId);
      
      if (!isCorrect && !isAlternative) {
        return; // Don't allow drop if it's not a correct answer
      }
    }
    
    // Handle multiple items per zone setting
    let updatedPlacements = [...placements];
    
    if (!settings.allowMultipleItemsPerZone) {
      // Remove any existing item in this zone
      updatedPlacements = updatedPlacements.filter((p) => p.zoneId !== zoneId);
    }
    
    // Also make sure this item isn't placed elsewhere
    const itemAlreadyPlaced = placements.find((p) => p.itemId === itemId);
    if (itemAlreadyPlaced) {
      updatedPlacements = updatedPlacements.filter((p) => p.itemId !== itemId);
    }
    
    // Add the new placement
    setPlacements([
      ...updatedPlacements,
      { itemId, zoneId },
    ]);
    
    // Reset states
    setDraggedItemId(null);
    setHoveredZoneId(null);
    setChecked(false);
  };

  const handleCheckAnswers = () => {
    const newResults: {[key: string]: boolean} = {};
    
    // Check each placement against the correct item for that zone
    placements.forEach((placement) => {
      const zone = safeDropZones.find((z) => z.id === placement.zoneId);
      if (zone) {
        const isCorrect = zone.correctItemId === placement.itemId;
        const isAlternative = zone.alternativeAnswers?.some((a) => a.itemId === placement.itemId);
        newResults[placement.zoneId] = isCorrect || !!isAlternative;
      }
    });
    
    setResults(newResults);
    setChecked(true);
  };

  const handleReset = () => {
    setPlacements([]);
    setResults({});
    setChecked(false);
  };
  
  // Check if an item is already placed in a zone
  const isItemPlaced = (itemId: string) => {
    return placements.some((p) => p.itemId === itemId);
  };
  
  // Find placement for a zone
  const getPlacementForZone = (zoneId: string) => {
    return placements.find((p) => p.zoneId === zoneId);
  };
  
  // Find item text by ID
  const getItemTextById = (itemId: string) => {
    const item = safeItems.find((i) => i.id === itemId);
    return item ? item.text : "";
  };
  
  // Default image dimensions
  const defaultWidth = 300;

  return (
    <div style={{ 
      backgroundColor: isNeonTheme ? "#0c0032" : isDarkTheme ? "#000000" : "#ffffff", 
      borderRadius: "0.5rem", 
      boxShadow: isNeonTheme ? "0 0 15px rgba(0, 242, 255, 0.3)" : isDarkTheme ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "0 1px 2px rgba(0, 0, 0, 0.1)", 
      border: isNeonTheme ? "1px solid #00f2ff" : isDarkTheme ? "1px solid #1f1f1f" : "1px solid #e5e7eb", 
      padding: "1.5rem", 
      width: "100%",
      zIndex: 30,
      position: "relative",
    }}>
      <div className="space-y-6">
        {/* Question title with theme-appropriate styling */}
        <div style={{ 
          backgroundColor: isNeonTheme ? "#190061" : isDarkTheme ? "#101010" : "#f8f9fa", 
          border: isNeonTheme ? "1px solid #7b2ff7" : isDarkTheme ? "1px solid #2a2a2a" : "1px solid #e5e7eb", 
          padding: "1rem", 
          borderRadius: "0.375rem",
          boxShadow: isNeonTheme ? "0 0 10px rgba(123, 47, 247, 0.3)" : "none",
        }}>
          <h2 style={{ 
            fontSize: "1.25rem", 
            fontWeight: "bold", 
            textAlign: "center", 
            color: isNeonTheme ? "#00f2ff" : isDarkTheme ? "#f5f2e5" : "#333333",
            textShadow: isNeonTheme ? "0 0 5px rgba(0, 242, 255, 0.7)" : "none",
          }}>{text}</h2>
        </div>
        
        {/* Top media image (if present) */}
        {mediaUrl && (
          <div className="flex justify-center mb-4">
            <img 
              src={mediaUrl} 
              alt="Vraag afbeelding"
              className="rounded-lg max-w-full h-auto max-h-[200px]"
              style={{
                maxWidth: imageSize?.width || defaultWidth,
                objectFit: "contain",
              }}
            />
          </div>
        )}

        {/* Main content area */}
        <div className="flex flex-col gap-6">
          {/* Available items */}
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            justifyContent: "center", 
            padding: "1rem", 
            marginBottom: "0.5rem", 
            border: isNeonTheme ? "1px solid #2a2a2a" : isDarkTheme ? "1px solid #1f1f1f" : "1px solid #e5e7eb", 
            backgroundColor: isNeonTheme ? "#101010" : isDarkTheme ? "#000000" : "#ffffff", 
            borderRadius: "0.375rem", 
          }}>
            {safeItems.map((item) => {
              const placed = isItemPlaced(item.id);
              // Determine item state for styling
              const isCorrect = checked && placements.some((p) => {
                const zone = safeDropZones.find((z) => z.id === p.zoneId);
                const isAlternative = zone?.alternativeAnswers?.some((a) => a.itemId === item.id);
                return p.itemId === item.id && (zone?.correctItemId === item.id || isAlternative);
              });
              
              const isIncorrect = checked && placements.some((p) => {
                const zone = safeDropZones.find((z) => z.id === p.zoneId);
                const isAlternative = zone?.alternativeAnswers?.some((a) => a.itemId === item.id);
                return p.itemId === item.id && zone?.correctItemId !== item.id && !isAlternative;
              });
              
              return (
                <div 
                  key={item.id}
                  draggable={!placed || settings.allowMultipleItemsPerZone}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "inline-flex items-center justify-center h-9 px-4 py-2 m-1.5 rounded-full select-none",
                    "text-sm font-medium text-primary-foreground shadow-sm transition-colors",
                    (!placed || settings.allowMultipleItemsPerZone) && "cursor-grab hover:bg-primary/80",
                    placed && !settings.allowMultipleItemsPerZone && "opacity-40 pointer-events-none",
                    isCorrect ? "bg-[#22c55e]" : 
                      isIncorrect ? "bg-destructive" : 
                        isNeonTheme ? "bg-primary" : isDarkTheme ? "bg-[#2a2a2a]" : "bg-[#f8f9fa]",
                  )}
                >
                  {item.text}
                </div>
              );
            })}
          </div>

          {/* Dropzones */}
          <div className="space-y-4 mb-4">
            {safeDropZones.length > 0 ? (
              safeDropZones.map((zone) => {
                const placement = getPlacementForZone(zone.id);
                const placedItemText = placement ? getItemTextById(placement.itemId) : "";
                const isCorrect = checked ? results[zone.id] : undefined;
                
                // Custom zone styling if defined
                const zoneStyle = zone.style || {};
                
                const renderPlacedItem = () => {
                  const placedItem = safeItems.find((item) => item.id === placement?.itemId);
                  const placedItemText = placedItem?.text || "";
                  const isCorrect = checked ? results[zone.id] : undefined;
                  
                  const baseStyle = {
                    minWidth: "150px",
                    color: isNeonTheme ? "#0c0032" : isDarkTheme ? "#f5f2e5" : "#333333",
                    fontWeight: "500",
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: zoneStyle.width,
                    height: zoneStyle.height,
                    borderRadius: "0.25rem",
                  };

                  const correctStyle = {
                    boxShadow: isNeonTheme ? "0 0 12px rgba(34, 197, 94, 0.5)" : "none",
                    backgroundColor: isNeonTheme ? "#22c55e" : isDarkTheme ? "#2a2a2a" : "#ffffff",
                    border: isNeonTheme ? "1px solid #22c55e" : isDarkTheme ? "1px solid #2a2a2a" : "1px solid #e5e7eb",
                  };

                  const incorrectStyle = {
                    boxShadow: isNeonTheme ? "0 0 12px rgba(225, 29, 72, 0.5)" : "none",
                    backgroundColor: isNeonTheme ? "#e11d48" : isDarkTheme ? "#2a2a2a" : "#ffffff",
                    border: isNeonTheme ? "1px solid #e11d48" : isDarkTheme ? "1px solid #2a2a2a" : "1px solid #e5e7eb",
                  };

                  const defaultStyle = {
                    boxShadow: isNeonTheme ? "0 0 8px rgba(0, 242, 255, 0.4)" : "none",
                    backgroundColor: isNeonTheme ? "#00f2ff" : isDarkTheme ? "#2a2a2a" : "#ffffff",
                    border: isNeonTheme ? "1px solid #7b2ff7" : isDarkTheme ? "1px solid #1f1f1f" : "1px solid #e5e7eb",
                  };

                  return (
                    <div
                      style={{
                        ...baseStyle,
                        ...(isCorrect === true && correctStyle),
                        ...(isCorrect === false && incorrectStyle),
                        ...(isCorrect === undefined && defaultStyle),
                      }}
                    >
                      {placedItemText}
                      {isCorrect !== undefined && (
                        <span className="ml-2">
                          {isCorrect ? <Check className="h-4 w-4 text-white" /> : <X className="h-4 w-4 text-white" />}
                        </span>
                      )}
                    </div>
                  );
                };
                
                const renderDropZone = () => {
                  // Determine if this zone is being hovered over
                  const isOver = hoveredZoneId === zone.id;
                  
                  const baseStyle = {
                    minWidth: "150px",
                    height: zoneStyle.height || "36px",
                    width: zoneStyle.width,
                    padding: zoneStyle.padding || "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 150ms",
                  };

                  const hoverStyle = {
                    backgroundColor: isNeonTheme ? "rgba(0, 242, 255, 0.1)" : isDarkTheme ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                    borderColor: isNeonTheme ? "#00f2ff" : isDarkTheme ? "#4a4a4a" : "#666666",
                    boxShadow: isNeonTheme ? "0 0 12px rgba(0, 242, 255, 0.5)" : "none",
                  };

                  const defaultStyle = {
                    backgroundColor: isNeonTheme ? "rgba(25, 0, 97, 0.3)" : isDarkTheme ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)",
                    borderColor: isNeonTheme ? "#7b2ff7" : isDarkTheme ? "#1f1f1f" : "#e5e7eb",
                    boxShadow: isNeonTheme ? "0 0 8px rgba(123, 47, 247, 0.3)" : "none",
                  };

                  return (
                    <div 
                      onDragOver={(e) => handleDragOver(e, zone.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, zone.id)}
                      style={{
                        ...baseStyle,
                        ...(isOver && hoverStyle),
                        ...(!isOver && defaultStyle),
                      }}
                    />
                  );
                };
                
                return (
                  <div key={zone.id} className="flex flex-wrap items-center gap-3 py-2 mb-3">
                    {zone.textPosition === "before" && (
                      <div className="flex-1 text-base">{zone.description}</div>
                    )}
                    
                    {placement ? renderPlacedItem() : renderDropZone()}
                    
                    {zone.textPosition === "after" && (
                      <div className="flex-1 text-base">{zone.description}</div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-gray-500">
                <p>Nog geen dropzones toegevoegd.</p>
                <p className="text-sm">Voeg dropzones toe in het "Drop Zones" tabblad.</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4 pt-2">
            <Button 
              onClick={handleCheckAnswers}
              disabled={placements.length < Math.min(safeDropZones.length, 1) || checked}
              className={isNeonTheme ? "bg-[#190061] hover:bg-[#2a0087] text-[#00f2ff] px-8 py-2 rounded-md border border-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.5)] hover:shadow-[0_0_12px_rgba(0,242,255,0.7)] transition-all" : isDarkTheme ? "bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md border border-blue-700 shadow-md hover:shadow-lg transition-all" : "bg-blue-500 hover:bg-blue-600 text-gray-800 px-8 py-2 rounded-md border border-gray-300 shadow-sm hover:shadow-md transition-all"}
            >
              Controleer
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleReset}
              className={isNeonTheme ? "bg-[#190061] text-[#00f2ff] px-8 py-2 rounded-md border border-[#7b2ff7] shadow-[0_0_8px_rgba(123,47,247,0.5)] hover:shadow-[0_0_12px_rgba(123,47,247,0.7)] transition-all" : isDarkTheme ? "bg-gray-700 text-white px-8 py-2 rounded-md border border-gray-600 shadow-md hover:shadow-lg transition-all" : "bg-gray-200 text-gray-800 px-8 py-2 rounded-md border border-gray-300 shadow-sm hover:shadow-md transition-all"}
            >
              Opnieuw
            </Button>
          </div>
        </div>

        {/* Score display */}
        {checked && Object.keys(results).length > 0 && (
          <div style={{ 
            marginTop: "1rem", 
            padding: "0.75rem", 
            backgroundColor: isNeonTheme ? "#190061" : isDarkTheme ? "#101010" : "#f8f9fa", 
            border: isNeonTheme ? "1px solid #7b2ff7" : isDarkTheme ? "1px solid #2a2a2a" : "1px solid #e5e7eb", 
            borderRadius: "0.375rem", 
            textAlign: "center",
            boxShadow: isNeonTheme ? "0 0 10px rgba(123, 47, 247, 0.3)" : "none",
          }}>
            <p style={{ fontWeight: "500", color: isNeonTheme ? "#00f2ff" : isDarkTheme ? "#f5f2e5" : "#333333", textShadow: isNeonTheme ? "0 0 5px rgba(0, 242, 255, 0.5)" : "none" }}>
              Score: {Object.values(results).filter(Boolean).length} / {Object.values(results).length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};