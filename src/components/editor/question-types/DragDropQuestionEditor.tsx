import type { DragEndEvent } from "@dnd-kit/core";
import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import { Info, Trash2, RefreshCw } from "lucide-react";
import React, { useState, useEffect } from "react";

import { MediaUpload } from "../form/MediaUpload";
import type { BaseQuestionEditorProps } from "../question-editors/base/BaseQuestionEditor";
import { withBaseQuestionEditor } from "../question-editors/base/BaseQuestionEditor";

import { DragDropQuestionPreview } from "./components/DragDropQuestionPreview";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { DragDropItem, DragDropZone, DragDropQuestion } from "@/types/editor";

import { Switch } from "@/components/ui/switch";

interface DragDropQuestionEditorProps extends BaseQuestionEditorProps {
  currentQuestion: DragDropQuestion;
  onQuestionChange: (question: DragDropQuestion) => void;
}

function DragDropQuestionEditorComponent({
  currentQuestion,
  onQuestionChange,
}: DragDropQuestionEditorProps) {
  const [fullText, setFullText] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleTextChange = (text: string) => {
    setFullText(text);
    
    // Extraheer woorden tussen asterisken en maak er items en dropzones van
    const items: DragDropItem[] = [];
    const dropZones: DragDropZone[] = [];
    const regex = /\*(.*?)\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const beforeText = text.slice(lastIndex, match.index);
      const word = match[1];
      lastIndex = match.index + match[0].length;
      
      // Maak een nieuw sleepbaar item
      const newItem: DragDropItem = {
        id: crypto.randomUUID(),
        text: word,
      };
      items.push(newItem);
      
      // Maak een nieuwe dropzone voor dit item
      const newZone: DragDropZone = {
        id: crypto.randomUUID(),
        beforeText: beforeText.trim(),
        afterText: "",
        correctItemId: newItem.id,
      };
      dropZones.push(newZone);
    }
    
    // Voeg de laatste tekst toe aan de laatste dropzone
    if (dropZones.length > 0 && lastIndex < text.length) {
      dropZones[dropZones.length - 1].afterText = text.slice(lastIndex).trim();
    }

    onQuestionChange({
      ...currentQuestion,
      items,
      dropZones,
    });
  };

  const handleMediaChange = (mediaUrl: string | undefined, imageSize?: { width: number; height: number }) => {
    onQuestionChange({
      ...currentQuestion,
      mediaUrl,
      imageSize,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // In de preview hoeven we niets te doen met drag events
    console.log("Drag ended:", event);
  };

  const handleDeleteItem = (itemId: string) => {
    // Find all zones that use this item
    const affectedZones = currentQuestion.dropZones.filter((zone) => zone.correctItemId === itemId);
    
    if (affectedZones.length > 0) {
      // Ask for confirmation before deleting
      if (!confirm(`Dit item wordt gebruikt in ${affectedZones.length} dropzones. Weet je zeker dat je het wilt verwijderen?`)) {
        return;
      }
    }
    
    // Remove the item
    const updatedItems = currentQuestion.items.filter((item) => item.id !== itemId);
    
    // Remove any zones that used this item or update them to use a default item if available
    let updatedZones = currentQuestion.dropZones;
    if (updatedItems.length > 0) {
      // If we still have items, update affected zones to use the first available item
      const firstItemId = updatedItems[0].id;
      updatedZones = currentQuestion.dropZones.map((zone) => 
        zone.correctItemId === itemId ? { ...zone, correctItemId: firstItemId } : zone,
      );
    } else {
      // If no items left, remove all zones
      updatedZones = [];
    }
    
    // Update the question
    onQuestionChange({
      ...currentQuestion,
      items: updatedItems,
      dropZones: updatedZones,
    });
    
    // Clear selection
    setSelectedItemId(null);
  };

  const handleDeleteZone = (zoneId: string) => {
    const updatedZones = currentQuestion.dropZones.filter((zone) => zone.id !== zoneId);
    
    // Update the question
    onQuestionChange({
      ...currentQuestion,
      dropZones: updatedZones,
    });
    
    // Clear selection
    setSelectedZoneId(null);
  };

  const handleRandomizeChange = (checked: boolean) => {
    onQuestionChange({
      ...currentQuestion,
      randomizeItems: checked,
    });
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId === selectedItemId ? null : itemId);
    setSelectedZoneId(null); // Clear zone selection when selecting an item
  };

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZoneId(zoneId === selectedZoneId ? null : zoneId);
    setSelectedItemId(null); // Clear item selection when selecting a zone
  };

  useEffect(() => {
    if (fullText === "" && currentQuestion.dropZones.length > 0) {
      let text = "";
      currentQuestion.dropZones.forEach((zone, index) => {
        const item = currentQuestion.items.find((item) => item.id === zone.correctItemId);
        text += zone.beforeText;
        text += item ? `*${item.text}*` : "**";
        text += zone.afterText;
        if (index < currentQuestion.dropZones.length - 1) {
          text += " ";
        }
      });
      setFullText(text);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="questionText">Opdracht</Label>
        <Input
          id="questionText"
          value={currentQuestion.text || ""}
          onChange={(e) => onQuestionChange({
            ...currentQuestion,
            text: e.target.value,
          })}
          placeholder="Typ hier je vraag..."
        />
      </div>

      <MediaUpload 
        media={currentQuestion.mediaUrl}
        imageSize={currentQuestion.imageSize}
        onMediaChange={handleMediaChange}
      />

      <div className="space-y-4">
        <Label>Tekst met invulplaatsen</Label>
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Plaats asterisken (*) rond de woorden die versleept moeten worden
          </AlertDescription>
        </Alert>
        <Card className="p-4">
          <Textarea
            value={fullText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Bijvoorbeeld: Een DNA-molecuul bestaat uit twee strengen van *nucleotiden*."
            rows={5}
          />
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="randomize"
          checked={currentQuestion.randomizeItems || false}
          onCheckedChange={handleRandomizeChange}
        />
        <Label htmlFor="randomize" className="cursor-pointer">Willekeurige volgorde van items</Label>
      </div>

      {currentQuestion.items.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Sleepbare items</Label>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setSelectedItemId(null)}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Deselecteren</span>
            </Button>
          </div>
          <Card className="p-4">
            <div className="flex flex-wrap gap-2">
              {currentQuestion.items.map((item) => (
                <div key={item.id} className="relative">
                  <Badge 
                    className={`cursor-pointer ${selectedItemId === item.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => handleItemSelect(item.id)}
                  >
                    {item.text}
                  </Badge>
                  {selectedItemId === item.id && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-5 w-5 absolute -top-2 -right-2 rounded-full"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {currentQuestion.dropZones.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Doelgebieden</Label>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setSelectedZoneId(null)}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Deselecteren</span>
            </Button>
          </div>
          <Card className="p-4">
            <div className="space-y-2">
              {currentQuestion.dropZones.map((zone) => {
                const correctItem = currentQuestion.items.find((item) => item.id === zone.correctItemId);
                return (
                  <div 
                    key={zone.id} 
                    className={`p-2 border rounded-md cursor-pointer ${selectedZoneId === zone.id ? "border-primary bg-primary/5" : "border-border"}`}
                    onClick={() => handleZoneSelect(zone.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p>
                          <span className="text-muted-foreground">{zone.beforeText}</span>
                          <span className="mx-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded">
                            {correctItem?.text || "..."}
                          </span>
                          <span className="text-muted-foreground">{zone.afterText}</span>
                        </p>
                      </div>
                      {selectedZoneId === zone.id && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 rounded-full ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteZone(zone.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Zone style settings */}
                    {selectedZoneId === zone.id && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <h4 className="text-sm font-medium mb-2">Doelgebied instellingen</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`zone-width-${zone.id}`} className="text-xs">Breedte</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id={`zone-width-${zone.id}`}
                                type="text"
                                value={zone.style?.width || "100%"}
                                onChange={(e) => {
                                  const updatedZones = currentQuestion.dropZones.map((z) => 
                                    z.id === zone.id 
                                      ? { 
                                        ...z, 
                                        style: { 
                                          ...z.style || {}, 
                                          width: e.target.value, 
                                        }, 
                                      } 
                                      : z,
                                  );
                                  onQuestionChange({
                                    ...currentQuestion,
                                    dropZones: updatedZones,
                                  });
                                }}
                                className="h-8"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`zone-height-${zone.id}`} className="text-xs">Hoogte</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id={`zone-height-${zone.id}`}
                                type="text"
                                value={zone.style?.height || "auto"}
                                onChange={(e) => {
                                  const updatedZones = currentQuestion.dropZones.map((z) => 
                                    z.id === zone.id 
                                      ? { 
                                        ...z, 
                                        style: { 
                                          ...z.style || {}, 
                                          height: e.target.value, 
                                        }, 
                                      } 
                                      : z,
                                  );
                                  onQuestionChange({
                                    ...currentQuestion,
                                    dropZones: updatedZones,
                                  });
                                }}
                                className="h-8"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`zone-bg-${zone.id}`} className="text-xs">Achtergrondkleur</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id={`zone-bg-${zone.id}`}
                                type="text"
                                value={zone.style?.backgroundColor || "transparent"}
                                onChange={(e) => {
                                  const updatedZones = currentQuestion.dropZones.map((z) => 
                                    z.id === zone.id 
                                      ? { 
                                        ...z, 
                                        style: { 
                                          ...z.style || {}, 
                                          backgroundColor: e.target.value, 
                                        }, 
                                      } 
                                      : z,
                                  );
                                  onQuestionChange({
                                    ...currentQuestion,
                                    dropZones: updatedZones,
                                  });
                                }}
                                className="h-8"
                              />
                              <div 
                                className="w-6 h-6 border border-border rounded" 
                                style={{ backgroundColor: zone.style?.backgroundColor || "transparent" }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`zone-border-${zone.id}`} className="text-xs">Randkleur</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id={`zone-border-${zone.id}`}
                                type="text"
                                value={zone.style?.borderColor || "#ddd"}
                                onChange={(e) => {
                                  const updatedZones = currentQuestion.dropZones.map((z) => 
                                    z.id === zone.id 
                                      ? { 
                                        ...z, 
                                        style: { 
                                          ...z.style || {}, 
                                          borderColor: e.target.value, 
                                        }, 
                                      } 
                                      : z,
                                  );
                                  onQuestionChange({
                                    ...currentQuestion,
                                    dropZones: updatedZones,
                                  });
                                }}
                                className="h-8"
                              />
                              <div 
                                className="w-6 h-6 border border-border rounded" 
                                style={{ backgroundColor: zone.style?.borderColor || "#ddd" }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`zone-padding-${zone.id}`} className="text-xs">Padding</Label>
                            <Input
                              id={`zone-padding-${zone.id}`}
                              type="text"
                              value={zone.style?.padding || "8px"}
                              onChange={(e) => {
                                const updatedZones = currentQuestion.dropZones.map((z) => 
                                  z.id === zone.id 
                                    ? { 
                                      ...z, 
                                      style: { 
                                        ...z.style || {}, 
                                        padding: e.target.value, 
                                      }, 
                                    } 
                                    : z,
                                );
                                onQuestionChange({
                                  ...currentQuestion,
                                  dropZones: updatedZones,
                                });
                              }}
                              className="h-8"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      <DragDropQuestionPreview
        text={currentQuestion.text || ""}
        items={currentQuestion.items}
        dropZones={currentQuestion.dropZones}
        mediaUrl={currentQuestion.mediaUrl}
        imageSize={currentQuestion.imageSize}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        randomizeItems={currentQuestion.randomizeItems}
      />

      {/* Feedback section */}
      <div className="space-y-4 border-t border-border pt-6 mt-6">
        <h3 className="text-lg font-medium">Feedback</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="correctFeedback">Feedback bij juist antwoord</Label>
            <Textarea
              id="correctFeedback"
              value={currentQuestion.correctFeedback || ""}
              onChange={(e) => onQuestionChange({
                ...currentQuestion,
                correctFeedback: e.target.value,
              })}
              placeholder="Goed gedaan!"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="incorrectFeedback">Feedback bij onjuist antwoord</Label>
            <Textarea
              id="incorrectFeedback"
              value={currentQuestion.incorrectFeedback || ""}
              onChange={(e) => onQuestionChange({
                ...currentQuestion,
                incorrectFeedback: e.target.value,
              })}
              placeholder="Probeer het nog eens."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox 
            id="showFeedbackImmediately"
            checked={currentQuestion.showFeedbackImmediately || false}
            onCheckedChange={(checked) => onQuestionChange({
              ...currentQuestion,
              showFeedbackImmediately: checked === true,
            })}
          />
          <Label htmlFor="showFeedbackImmediately" className="cursor-pointer">
            Toon feedback direct na het beantwoorden
          </Label>
        </div>
      </div>
    </div>
  );
}

export const DragDropQuestionEditor = withBaseQuestionEditor<DragDropQuestionEditorProps>(DragDropQuestionEditorComponent);
