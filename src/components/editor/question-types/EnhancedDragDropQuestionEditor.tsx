

import { Input } from '@/components/ui/input';
import { EnhancedDragDropPreview } from './components/EnhancedDragDropPreview';
import { 
  PlusCircle, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Info, 
  Settings, 
  FileImage, 
  Target, 
  Copy, 
  List, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Palette
} from 'lucide-react';
import React, { useState } from 'react';
import { EditableText } from '../form/EditableText';
import { MediaUpload } from '../form/MediaUpload';
import { withBaseQuestionEditor } from "../question-editors/base/BaseQuestionEditor";
import type { ValidationError } from "../question-editors/base/BaseQuestionEditor";

import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import { DragDropZone } from "@/types/editor";
import type { Question, DragDropItem} from "@/types/editor";

interface EnhancedDragDropQuestionProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
  validateQuestion?: (question: Question) => ValidationError[];
  showNameField?: boolean;
}

function EnhancedDragDropQuestionEditorBase({
  currentQuestion,
  onQuestionChange,
  showNameField = true,
}: EnhancedDragDropQuestionProps) {
  const [newItemText, setNewItemText] = useState("");
  const [newDropZoneText, setNewDropZoneText] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showSettings, setShowSettings] = useState(false);
  const [activeDropZoneId, setActiveDropZoneId] = useState<string | null>(null);
  
  // Basic handlers
  const handleQuestionTextChange = (newText: string) => {
    onQuestionChange({
      ...currentQuestion,
      text: newText,
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuestionChange({
      ...currentQuestion,
      name: e.target.value,
    });
  };

  const handleMediaChange = (mediaUrl: string | undefined, imageSize?: { width: number; height: number }) => {
    onQuestionChange({
      ...currentQuestion,
      mediaUrl,
      imageSize,
    });
  };

  // Item management
  const addItem = () => {
    if (!newItemText.trim()) {
      return;
    }
    
    const items = [...(currentQuestion.items as DragDropItem[] || [])];
    items.push({
      id: crypto.randomUUID(),
      text: newItemText.trim(),
    });
    
    onQuestionChange({
      ...currentQuestion,
      items,
    });
    
    setNewItemText("");
  };

  const removeItem = (id: string) => {
    const items = (currentQuestion.items as DragDropItem[] || []).filter((item) => item.id !== id);
    
    // Also remove any dropzone references to this item
    const dropZones = (currentQuestion.dropZones || []).map((zone) => {
      if (zone.correctItemId === id) {
        return { ...zone, correctItemId: "" };
      }
      // Also check alternative answers if they exist
      if (zone.alternativeAnswers?.some((a) => a.itemId === id)) {
        return {
          ...zone,
          alternativeAnswers: zone.alternativeAnswers.filter((a) => a.itemId !== id),
        };
      }
      return zone;
    });
    
    onQuestionChange({
      ...currentQuestion,
      items,
      dropZones,
    });
  };

  const updateItem = (id: string, text: string) => {
    const items = (currentQuestion.items as DragDropItem[] || []).map((item) => 
      item.id === id ? { ...item, text } : item,
    );
    
    onQuestionChange({
      ...currentQuestion,
      items,
    });
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    const items = [...(currentQuestion.items as DragDropItem[] || [])];
    const index = items.findIndex((item) => item.id === id);
    
    if (index === -1) {
      return;
    }
    
    if (direction === "up" && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === "down" && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    }
    
    onQuestionChange({
      ...currentQuestion,
      items,
    });
  };

  // Drop Zone management
  const addDropZone = () => {
    if (!newDropZoneText.trim()) {
      return;
    }
    
    // Ensure dropZones is always initialized properly
    const existingDropZones = Array.isArray(currentQuestion.dropZones) 
      ? [...currentQuestion.dropZones] 
      : [];
    
    // Add new dropzone with a unique ID
    const newDropZone = {
      id: crypto.randomUUID(),
      description: newDropZoneText.trim(),
      textPosition: "before" as const,
      correctItemId: "",
    };
    
    const updatedDropZones = [...existingDropZones, newDropZone];
    
    // Create the full updated question
    const updatedQuestion = {
      ...currentQuestion,
      dropZones: updatedDropZones,
    };
    
    // Update the question
    onQuestionChange(updatedQuestion);
    
    // Reset input field
    setNewDropZoneText("");
    
    // Set this as the active drop zone
    setActiveDropZoneId(newDropZone.id);
  };

  const removeDropZone = (id: string) => {
    const existingDropZones = Array.isArray(currentQuestion.dropZones) 
      ? [...currentQuestion.dropZones] 
      : [];
    
    const updatedDropZones = existingDropZones.filter((zone) => zone.id !== id);
    
    onQuestionChange({
      ...currentQuestion,
      dropZones: updatedDropZones,
    });
    
    if (activeDropZoneId === id) {
      setActiveDropZoneId(null);
    }
  };

  const duplicateDropZone = (id: string) => {
    const existingDropZones = Array.isArray(currentQuestion.dropZones) 
      ? [...currentQuestion.dropZones] 
      : [];
    
    const zoneToDuplicate = existingDropZones.find((zone) => zone.id === id);
    if (!zoneToDuplicate) {
      return;
    }
    
    const duplicatedZone = {
      ...zoneToDuplicate,
      id: crypto.randomUUID(),
      description: `${zoneToDuplicate.description} (kopie)`,
    };
    
    const updatedDropZones = [...existingDropZones, duplicatedZone];
    
    onQuestionChange({
      ...currentQuestion,
      dropZones: updatedDropZones,
    });
    
    // Set the duplicated zone as active
    setActiveDropZoneId(duplicatedZone.id);
  };

  const updateDropZone = (id: string, field: string, value: any) => {
    const existingDropZones = Array.isArray(currentQuestion.dropZones) 
      ? [...currentQuestion.dropZones] 
      : [];
    
    const updatedDropZones = existingDropZones.map((zone) => 
      zone.id === id ? { ...zone, [field]: value } : zone,
    );
    
    onQuestionChange({
      ...currentQuestion,
      dropZones: updatedDropZones,
    });
  };

  const updateDropZoneStyle = (id: string, styleField: string, value: string) => {
    const existingDropZones = Array.isArray(currentQuestion.dropZones) 
      ? [...currentQuestion.dropZones] 
      : [];
    
    const updatedDropZones = existingDropZones.map((zone) => {
      if (zone.id === id) {
        return {
          ...zone,
          style: {
            ...(zone.style || {}),
            [styleField]: value,
          },
        };
      }
      return zone;
    });
    
    onQuestionChange({
      ...currentQuestion,
      dropZones: updatedDropZones,
    });
  };

  const updateSpecificFeedback = (id: string, feedbackType: "correct" | "incorrect", value: string) => {
    const existingDropZones = Array.isArray(currentQuestion.dropZones) 
      ? [...currentQuestion.dropZones] 
      : [];
    
    const updatedDropZones = existingDropZones.map((zone) => {
      if (zone.id === id) {
        return {
          ...zone,
          specificFeedback: {
            ...(zone.specificFeedback || {}),
            [feedbackType]: value,
          },
        };
      }
      return zone;
    });
    
    onQuestionChange({
      ...currentQuestion,
      dropZones: updatedDropZones,
    });
  };

  const addAlternativeAnswer = (zoneId: string, itemId: string) => {
    if (!itemId || itemId === "placeholder") {
      return;
    }
    
    const existingDropZones = Array.isArray(currentQuestion.dropZones) 
      ? [...currentQuestion.dropZones] 
      : [];
    
    const updatedDropZones = existingDropZones.map((zone) => {
      if (zone.id === zoneId) {
        // Check if this item is already the correct answer
        if (zone.correctItemId === itemId) {
          return zone;
        }
        
        // Check if this item is already an alternative answer
        const existingAlternatives = zone.alternativeAnswers || [];
        if (existingAlternatives.some((a) => a.itemId === itemId)) {
          return zone;
        }
        
        return {
          ...zone,
          alternativeAnswers: [
            ...(zone.alternativeAnswers || []),
            {
              id: crypto.randomUUID(),
              itemId: itemId,
              feedbackText: "",
            },
          ],
        };
      }
      return zone;
    });
    
    onQuestionChange({
      ...currentQuestion,
      dropZones: updatedDropZones,
    });
  };

  const removeAlternativeAnswer = (zoneId: string, alternativeId: string) => {
    const existingDropZones = Array.isArray(currentQuestion.dropZones) 
      ? [...currentQuestion.dropZones] 
      : [];
    
    const updatedDropZones = existingDropZones.map((zone) => {
      if (zone.id === zoneId && zone.alternativeAnswers) {
        return {
          ...zone,
          alternativeAnswers: zone.alternativeAnswers.filter((a) => a.id !== alternativeId),
        };
      }
      return zone;
    });
    
    onQuestionChange({
      ...currentQuestion,
      dropZones: updatedDropZones,
    });
  };

  const updateAlternativeAnswerFeedback = (zoneId: string, alternativeId: string, feedbackText: string) => {
    const existingDropZones = Array.isArray(currentQuestion.dropZones) 
      ? [...currentQuestion.dropZones] 
      : [];
    
    const updatedDropZones = existingDropZones.map((zone) => {
      if (zone.id === zoneId && zone.alternativeAnswers) {
        return {
          ...zone,
          alternativeAnswers: zone.alternativeAnswers.map((alt) => 
            alt.id === alternativeId ? { ...alt, feedbackText } : alt,
          ),
        };
      }
      return zone;
    });
    
    onQuestionChange({
      ...currentQuestion,
      dropZones: updatedDropZones,
    });
  };

  const moveDropZone = (id: string, direction: "up" | "down") => {
    const existingDropZones = Array.isArray(currentQuestion.dropZones) 
      ? [...currentQuestion.dropZones] 
      : [];
    
    const index = existingDropZones.findIndex((zone) => zone.id === id);
    
    if (index === -1) {
      return;
    }
    
    if (direction === "up" && index > 0) {
      [existingDropZones[index], existingDropZones[index - 1]] = 
        [existingDropZones[index - 1], existingDropZones[index]];
    } else if (direction === "down" && index < existingDropZones.length - 1) {
      [existingDropZones[index], existingDropZones[index + 1]] = 
        [existingDropZones[index + 1], existingDropZones[index]];
    }
    
    onQuestionChange({
      ...currentQuestion,
      dropZones: existingDropZones,
    });
  };

  const generateDropZonesFromItems = () => {
    const existingItems = Array.isArray(currentQuestion.items) 
      ? currentQuestion.items as DragDropItem[] 
      : [];
    
    if (existingItems.length === 0) {
      return;
    }
    
    // Create a drop zone for each item
    const generatedDropZones = existingItems.map((item) => ({
      id: crypto.randomUUID(),
      description: `Plaats hier het juiste woord voor: ${item.text}`,
      textPosition: "before" as const, 
      correctItemId: item.id,
    }));
    
    onQuestionChange({
      ...currentQuestion,
      dropZones: generatedDropZones,
    });
  };

  const clearAllDropZones = () => {
    if (window.confirm("Weet je zeker dat je alle dropzones wilt verwijderen?")) {
      onQuestionChange({
        ...currentQuestion,
        dropZones: [],
      });
    }
  };

  // Drop Zone Settings management
  const updateDropZoneSetting = (setting: string, value: any) => {
    onQuestionChange({
      ...currentQuestion,
      dropZoneSettings: {
        ...(currentQuestion.dropZoneSettings || {}),
        [setting]: value,
      },
    });
  };

  // General settings
  const updateSetting = (setting: string, value: any) => {
    onQuestionChange({
      ...currentQuestion,
      settings: {
        ...(currentQuestion.settings || {}),
        [setting]: value,
      },
    });
  };

  // Get current settings with defaults
  const settings = {
    shuffleItems: currentQuestion.settings?.shuffleItems || false,
    maxAttempts: currentQuestion.settings?.maxAttempts || 1,
    feedbackType: currentQuestion.settings?.feedbackType || "afterCheck",
    ...currentQuestion.settings,
  };

  // Get current drop zone settings with defaults
  const dropZoneSettings = {
    allowMultipleItemsPerZone: false,
    onlyAcceptCorrectItems: false,
    returnItemsToOrigin: true,
    highlightColor: "#e6f7ff",
    feedbackStyle: "all",
    animationType: "fade",
    ...(currentQuestion.dropZoneSettings || {}),
  };

  // Ensure we're working with the right data structures
  const items = Array.isArray(currentQuestion.items) 
    ? currentQuestion.items as DragDropItem[] 
    : [];
  
  const dropZones = Array.isArray(currentQuestion.dropZones) 
    ? currentQuestion.dropZones 
    : [];

  const { theme } = useTheme();

  const isNeonTheme = theme === "neon";
  const isDarkTheme = theme === "dark";

  return (
    <div className="flex flex-col gap-8">
      {/* Editor panel */}
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Drag-and-Drop Vraag Editor</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Instellingen
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic">Basisgegevens</TabsTrigger>
            <TabsTrigger value="items">Sleepbare Items</TabsTrigger>
            <TabsTrigger value="zones">Drop Zones</TabsTrigger>
            <TabsTrigger value="media">Afbeelding</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card className="p-4 space-y-4">

              <div className="space-y-2">
                <Label htmlFor="question-text">Vraagtekst voor leerling</Label>
                <Textarea
                  id="question-text"
                  value={currentQuestion.text || "Sleep de juiste termen naar de beschrijving"}
                  onChange={(e) => handleQuestionTextChange(e.target.value)}
                  placeholder="Bijvoorbeeld: Sleep de juiste termen naar de bijbehorende beschrijvingen"
                  rows={3}
                />
              </div>
              
              {showSettings && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-sm font-medium mb-2">Geavanceerde instellingen</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="shuffle-items" className="text-sm">Items willekeurig plaatsen</Label>
                        <p className="text-xs text-muted-foreground">Items krijgen elke keer een andere volgorde</p>
                      </div>
                      <Switch 
                        id="shuffle-items" 
                        checked={settings.shuffleItems}
                        onCheckedChange={(checked) => updateSetting("shuffleItems", checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max-attempts" className="text-sm">Maximum aantal pogingen</Label>
                      <Select 
                        value={settings.maxAttempts.toString()} 
                        onValueChange={(value) => updateSetting("maxAttempts", parseInt(value))}
                      >
                        <SelectTrigger id="max-attempts">
                          <SelectValue placeholder="Kies max. aantal pogingen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 poging</SelectItem>
                          <SelectItem value="2">2 pogingen</SelectItem>
                          <SelectItem value="3">3 pogingen</SelectItem>
                          <SelectItem value="0">Onbeperkt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="feedback-type" className="text-sm">Feedback moment</Label>
                      <Select 
                        value={settings.feedbackType} 
                        onValueChange={(value) => updateSetting("feedbackType", value)}
                      >
                        <SelectTrigger id="feedback-type">
                          <SelectValue placeholder="Kies feedbackmoment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="afterCheck">Na klikken op 'Controleer'</SelectItem>
                          <SelectItem value="immediate">Direct bij plaatsen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Voeg hier de termen toe die leerlingen moeten kunnen slepen.
              </AlertDescription>
            </Alert>
            
            <Card className="p-4 space-y-4">
              <div className="grid gap-3">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 bg-secondary/30 p-2 rounded-md">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full shrink-0">
                      {index + 1}
                    </Badge>
                    
                    <Input
                      value={item.text}
                      onChange={(e) => updateItem(item.id, e.target.value)}
                      className="flex-1"
                      placeholder="Term tekst"
                    />
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveItem(item.id, "up")}
                        disabled={index === 0}
                        title="Verplaats omhoog"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveItem(item.id, "down")}
                        disabled={index === items.length - 1}
                        title="Verplaats omlaag"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Verwijder item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {items.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Nog geen sleepbare items toegevoegd.</p>
                  <p className="text-sm">Voeg hieronder je eerste item toe.</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Input
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Nieuw sleepbaar item toevoegen..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                />
                <Button onClick={addItem} className="shrink-0 bg-blue-500 hover:bg-blue-600">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Toevoegen
                </Button>
              </div>
            </Card>
          </TabsContent>
          
          {/* Dropzones Tab */}
          <TabsContent value="zones" className="space-y-4">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-700">
                Drop Zones
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="ml-2 cursor-help">
                      <HelpCircle className="h-4 w-4 text-blue-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Drop zones zijn de plekken waar leerlingen items naartoe moeten slepen.</p>
                      <p className="mt-2">Elke drop zone bestaat uit:</p>
                      <ul className="list-disc ml-5 mt-1">
                        <li>Een beschrijvende tekst</li>
                        <li>De positie van de tekst (voor of na de drop zone)</li>
                        <li>Een correct antwoord (en eventuele alternatieven)</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </AlertTitle>
              <AlertDescription>
                Definieer hier de locaties waar leerlingen de termen naartoe moeten slepen.
              </AlertDescription>
            </Alert>
            
            <Card className="p-4 space-y-5">
              {/* List of existing dropzones */}
              <div className="space-y-4">
                {dropZones.map((zone, index) => (
                  <div 
                    key={zone.id} 
                    className={cn(
                      "border rounded-md p-3 transition-all",
                      activeDropZoneId === zone.id ? "border-blue-400 shadow-sm bg-blue-50" : "border-gray-200",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full shrink-0">
                          {index + 1}
                        </Badge>
                        <h4 className="font-medium">Drop Zone {index + 1}</h4>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setActiveDropZoneId(activeDropZoneId === zone.id ? null : zone.id)}
                          title={activeDropZoneId === zone.id ? "Verberg details" : "Toon details"}
                        >
                          {activeDropZoneId === zone.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => moveDropZone(zone.id, "up")}
                          disabled={index === 0}
                          title="Verplaats omhoog"
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => moveDropZone(zone.id, "down")}
                          disabled={index === dropZones.length - 1}
                          title="Verplaats omlaag"
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => duplicateDropZone(zone.id)}
                          title="Dupliceer deze dropzone"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeDropZone(zone.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Verwijder dropzone"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Basic info visible even when not active */}
                    <div className="flex flex-col gap-2 mb-2">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-3">
                          <Label className="text-xs text-gray-500 mb-1 block">Tekst</Label>
                          <div className="text-sm truncate">{zone.description || "(Geen beschrijving)"}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Correct antwoord</Label>
                          <div className="text-sm truncate">
                            {zone.correctItemId ? (
                              items.find((i) => i.id === zone.correctItemId)?.text || "Onbekend"
                            ) : (
                              <span className="text-red-500">Niet geselecteerd</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded details when active */}
                    {activeDropZoneId === zone.id && (
                      <div className="pt-3 border-t border-gray-200 mt-2 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Beschrijvende tekst</Label>
                          <Textarea
                            value={zone.description}
                            onChange={(e) => updateDropZone(zone.id, "description", e.target.value)}
                            placeholder="Beschrijvende tekst voor deze dropzone..."
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Tekst positie</Label>
                          <RadioGroup 
                            value={zone.textPosition} 
                            onValueChange={(value) => updateDropZone(zone.id, "textPosition", value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="before" id={`text-before-${zone.id}`} />
                              <Label htmlFor={`text-before-${zone.id}`} className="cursor-pointer">Tekst voor dropzone</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="after" id={`text-after-${zone.id}`} />
                              <Label htmlFor={`text-after-${zone.id}`} className="cursor-pointer">Tekst na dropzone</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Correct antwoord</Label>
                          <Select
                            value={zone.correctItemId || "placeholder"}
                            onValueChange={(value) => updateDropZone(zone.id, "correctItemId", value === "placeholder" ? "" : value)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Selecteer correct item" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="placeholder">Selecteer correct item</SelectItem>
                              {items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.text}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Accordion type="single" collapsible className="w-full">
                          {/* Alternative answers section */}
                          <AccordionItem value="alternatives" className="border rounded-md">
                            <AccordionTrigger className="px-4 py-2 hover:no-underline">
                              <span className="text-sm font-medium">Alternatieve Antwoorden</span>
                            </AccordionTrigger>
                            <AccordionContent className="border-t px-4 py-3">
                              <div className="space-y-3">
                                {zone.alternativeAnswers?.length ? (
                                  <div className="space-y-3">
                                    {zone.alternativeAnswers.map((alt) => (
                                      <div key={alt.id} className="flex items-start gap-2 bg-secondary/30 p-2 rounded-md">
                                        <div className="flex-1">
                                          <div className="text-sm font-medium mb-1">
                                            {items.find((i) => i.id === alt.itemId)?.text || "Onbekend"}
                                          </div>
                                          <div className="space-y-1">
                                            <Label className="text-xs">Specifieke feedback (optioneel)</Label>
                                            <Input
                                              value={alt.feedbackText || ""}
                                              onChange={(e) => updateAlternativeAnswerFeedback(zone.id, alt.id, e.target.value)}
                                              placeholder="Feedback voor dit alternatieve antwoord..."
                                              className="text-sm"
                                            />
                                          </div>
                                        </div>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={() => removeAlternativeAnswer(zone.id, alt.id)}
                                          className="text-red-500 mt-1"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center text-gray-500 text-sm py-2">
                                    <p>Geen alternatieve antwoorden toegevoegd.</p>
                                  </div>
                                )}
                                
                                <div className="pt-2">
                                  <Label className="text-sm mb-1 block">Voeg alternatief antwoord toe</Label>
                                  <div className="flex gap-2">
                                    <Select
                                      onValueChange={(value) => addAlternativeAnswer(zone.id, value)}
                                    >
                                      <SelectTrigger className="flex-1 bg-white">
                                        <SelectValue placeholder="Selecteer alternatief item" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {items
                                          .filter((item) => item.id !== zone.correctItemId)
                                          .filter((item) => !zone.alternativeAnswers?.some((alt) => alt.itemId === item.id))
                                          .map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                              {item.text}
                                            </SelectItem>
                                          ))
                                        }
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          {/* Feedback settings */}
                          <AccordionItem value="feedback" className="border rounded-md mt-2">
                            <AccordionTrigger className="px-4 py-2 hover:no-underline">
                              <span className="text-sm font-medium">Feedback Instellingen</span>
                            </AccordionTrigger>
                            <AccordionContent className="border-t px-4 py-3">
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label className="text-sm">Feedback bij correct antwoord (optioneel)</Label>
                                  <Textarea
                                    value={zone.specificFeedback?.correct || ""}
                                    onChange={(e) => updateSpecificFeedback(zone.id, "correct", e.target.value)}
                                    placeholder="Feedback die getoond wordt bij een correct antwoord..."
                                    rows={2}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm">Feedback bij incorrect antwoord (optioneel)</Label>
                                  <Textarea
                                    value={zone.specificFeedback?.incorrect || ""}
                                    onChange={(e) => updateSpecificFeedback(zone.id, "incorrect", e.target.value)}
                                    placeholder="Feedback die getoond wordt bij een incorrect antwoord..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          {/* Visual styling */}
                          <AccordionItem value="styling" className="border rounded-md mt-2">
                            <AccordionTrigger className="px-4 py-2 hover:no-underline">
                              <span className="text-sm font-medium">Visuele Opmaak</span>
                            </AccordionTrigger>
                            <AccordionContent className="border-t px-4 py-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm">Breedte (bijv. 150px, 10rem, 50%)</Label>
                                  <Input
                                    value={zone.style?.width || ""}
                                    onChange={(e) => updateDropZoneStyle(zone.id, "width", e.target.value)}
                                    placeholder="Standaard"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm">Hoogte (bijv. 40px, 3rem)</Label>
                                  <Input
                                    value={zone.style?.height || ""}
                                    onChange={(e) => updateDropZoneStyle(zone.id, "height", e.target.value)}
                                    placeholder="Standaard"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm">Achtergrondkleur</Label>
                                  <div className="flex items-center gap-2">
                                    <Popover>
                                      <PopoverTrigger>
                                        <div 
                                          className="w-6 h-6 rounded border cursor-pointer"
                                          style={{ backgroundColor: zone.style?.backgroundColor || "#f3f4f6" }}
                                        />
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <div className="grid grid-cols-6 gap-1 p-2">
                                          {["#f3f4f6", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280", "#4b5563", 
                                            "#e6f7ff", "#bae7ff", "#91d5ff", "#69c0ff", "#40a9ff", "#1890ff",
                                            "#f0fdf4", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e",
                                            "#fff1f2", "#fecdd3", "#fda4af", "#fb7185", "#f43f5e", "#e11d48"].map((color) => (
                                            <div
                                              key={color}
                                              className="w-5 h-5 rounded cursor-pointer hover:opacity-80"
                                              style={{ backgroundColor: color }}
                                              onClick={() => updateDropZoneStyle(zone.id, "backgroundColor", color)}
                                            />
                                          ))}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                    <Input
                                      value={zone.style?.backgroundColor || ""}
                                      onChange={(e) => updateDropZoneStyle(zone.id, "backgroundColor", e.target.value)}
                                      placeholder="#f3f4f6"
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm">Randkleur</Label>
                                  <div className="flex items-center gap-2">
                                    <Popover>
                                      <PopoverTrigger>
                                        <div 
                                          className="w-6 h-6 rounded border cursor-pointer"
                                          style={{ backgroundColor: zone.style?.borderColor || "#d1d5db" }}
                                        />
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <div className="grid grid-cols-6 gap-1 p-2">
                                          {["#d1d5db", "#9ca3af", "#6b7280", "#4b5563", "#374151", "#1f2937", 
                                            "#bae7ff", "#91d5ff", "#69c0ff", "#40a9ff", "#1890ff", "#096dd9",
                                            "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d",
                                            "#fecdd3", "#fda4af", "#fb7185", "#f43f5e", "#e11d48", "#be123c"].map((color) => (
                                            <div
                                              key={color}
                                              className="w-5 h-5 rounded cursor-pointer hover:opacity-80"
                                              style={{ backgroundColor: color }}
                                              onClick={() => updateDropZoneStyle(zone.id, "borderColor", color)}
                                            />
                                          ))}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                    <Input
                                      value={zone.style?.borderColor || ""}
                                      onChange={(e) => updateDropZoneStyle(zone.id, "borderColor", e.target.value)}
                                      placeholder="#d1d5db"
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm">Padding (bijv. 8px, 0.5rem)</Label>
                                  <Input
                                    value={zone.style?.padding || ""}
                                    onChange={(e) => updateDropZoneStyle(zone.id, "padding", e.target.value)}
                                    placeholder="Standaard"
                                  />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}
                  </div>
                ))}
                
                {dropZones.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <List className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Nog geen dropzones toegevoegd.</p>
                    <p className="text-sm">Voeg hieronder je eerste dropzone toe.</p>
                  </div>
                )}
              </div>
              
              {/* Add new dropzone form */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium mb-2">Nieuwe Drop Zone</h4>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    addDropZone();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newDropZoneText}
                    onChange={(e) => setNewDropZoneText(e.target.value)}
                    placeholder="Beschrijvende tekst voor nieuwe dropzone..."
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    className="shrink-0 bg-blue-500 hover:bg-blue-600"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Toevoegen
                  </Button>
                </form>
              </div>
              
              {/* Quick actions for dropzones */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3 items-center justify-between">
                <h4 className="text-sm font-medium">Snelle acties</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateDropZonesFromItems}
                    disabled={items.length === 0}
                    title="Genereert een dropzone voor elk item"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Automatisch genereren
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllDropZones}
                    disabled={dropZones.length === 0}
                    className="text-red-500 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Alles wissen
                  </Button>
                </div>
              </div>
              
              {/* Global dropzone settings */}
              <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="globalSettings" className="border rounded-md">
                  <AccordionTrigger className="px-4 py-2 hover:no-underline">
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Globale Drop Zone Instellingen</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t px-4 py-3">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allow-multiple" className="font-medium">Meerdere items per dropzone</Label>
                          <p className="text-xs text-muted-foreground">Sta toe dat meerdere items naar dezelfde dropzone worden gesleept</p>
                        </div>
                        <Switch 
                          id="allow-multiple" 
                          checked={dropZoneSettings.allowMultipleItemsPerZone}
                          onCheckedChange={(checked) => updateDropZoneSetting("allowMultipleItemsPerZone", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="only-correct" className="font-medium">Alleen correcte antwoorden accepteren</Label>
                          <p className="text-xs text-muted-foreground">Sta alleen toe dat correcte items in een dropzone worden geplaatst</p>
                        </div>
                        <Switch 
                          id="only-correct" 
                          checked={dropZoneSettings.onlyAcceptCorrectItems}
                          onCheckedChange={(checked) => updateDropZoneSetting("onlyAcceptCorrectItems", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="return-origin" className="font-medium">Terugkeren naar oorsprong</Label>
                          <p className="text-xs text-muted-foreground">Items keren terug naar de oorspronkelijke locatie bij incorrect plaatsen</p>
                        </div>
                        <Switch 
                          id="return-origin" 
                          checked={dropZoneSettings.returnItemsToOrigin}
                          onCheckedChange={(checked) => updateDropZoneSetting("returnItemsToOrigin", checked)}
                        />
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-medium">Highlight kleur bij hover</Label>
                          <div className="flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger>
                                <div 
                                  className="w-6 h-6 rounded border cursor-pointer"
                                  style={{ backgroundColor: dropZoneSettings.highlightColor || "#e6f7ff" }}
                                />
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <div className="grid grid-cols-6 gap-1 p-2">
                                  {["#f0fdf4", "#e6f7ff", "#f0f7ff", "#fef3f2", "#fffaf0", "#f5f5f5", 
                                    "#dcfce7", "#bae7ff", "#e1effe", "#fee2e2", "#ffedd5", "#e5e5e5",
                                    "#bbf7d0", "#91d5ff", "#bae3ff", "#fed7d7", "#fbd38d", "#d4d4d4"].map((color) => (
                                    <div
                                      key={color}
                                      className="w-5 h-5 rounded cursor-pointer hover:opacity-80"
                                      style={{ backgroundColor: color }}
                                      onClick={() => updateDropZoneSetting("highlightColor", color)}
                                    />
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Input
                              value={dropZoneSettings.highlightColor || ""}
                              onChange={(e) => updateDropZoneSetting("highlightColor", e.target.value)}
                              placeholder="#e6f7ff"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="font-medium">Feedback visualisatie</Label>
                          <Select
                            value={dropZoneSettings.feedbackStyle || "all"}
                            onValueChange={(value) => updateDropZoneSetting("feedbackStyle", value)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Kies visualisatie stijl" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Alles (kleur + icoon + tekst)</SelectItem>
                              <SelectItem value="icon">Alleen icoon</SelectItem>
                              <SelectItem value="color">Alleen kleur</SelectItem>
                              <SelectItem value="text">Alleen tekst</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="font-medium">Animatie bij plaatsen</Label>
                          <Select
                            value={dropZoneSettings.animationType || "fade"}
                            onValueChange={(value) => updateDropZoneSetting("animationType", value)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Kies animatie type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fade">Fade</SelectItem>
                              <SelectItem value="bounce">Bounce</SelectItem>
                              <SelectItem value="shake">Shake</SelectItem>
                              <SelectItem value="none">Geen animatie</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </TabsContent>
          
          {/* Media Tab */}
          <TabsContent value="media" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Ondersteunende Afbeelding</Label>
                <MediaUpload 
                  media={currentQuestion.mediaUrl}
                  imageSize={currentQuestion.imageSize}
                  onMediaChange={handleMediaChange}
                />
              </div>
              
              {!currentQuestion.mediaUrl && (
                <div className="py-8 text-center text-gray-500">
                  <FileImage className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Nog geen afbeelding toegevoegd.</p>
                  <p className="text-sm">Klik hierboven om een afbeelding toe te voegen.</p>
                </div>
              )}
              
              {currentQuestion.mediaUrl && (
                <div className="space-y-2">
                  <Label className="text-sm">Positie van afbeelding</Label>
                  <Select
                    value={currentQuestion.settings?.imagePosition || "right"}
                    onValueChange={(value) => updateSetting("imagePosition", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Positie van afbeelding" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Bovenaan (voor de vraag)</SelectItem>
                      <SelectItem value="right">Rechts (naast de vraag)</SelectItem>
                      <SelectItem value="bottom">Onderaan (na de vraag)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom panel - Preview */}
      <div className="w-full mt-6 relative" style={{ 
        backgroundColor: isNeonTheme ? "#0c0032" : isDarkTheme ? "#000000" : "#ffffff", 
        boxShadow: isNeonTheme ? "0 0 15px rgba(0, 242, 255, 0.3)" : isDarkTheme ? "0 1px 3px rgba(0, 0, 0, 0.2)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
        padding: "1rem", 
        zIndex: 10, 
        position: "relative",
        color: isNeonTheme ? "#00f2ff" : isDarkTheme ? "#ffffff" : "#000000", 
      }}>
        {/* Black overlay to ensure no white shows through */}
        <div style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: isNeonTheme ? "#0c0032" : isDarkTheme ? "#000000" : "#ffffff", 
          zIndex: 5, 
        }} />
        <div style={{ 
          backgroundColor: isNeonTheme ? "#0c0032" : isDarkTheme ? "#000000" : "#ffffff", 
          border: isNeonTheme ? "1px solid #00f2ff" : isDarkTheme ? "1px solid #333333" : "1px solid #e5e7eb",
          boxShadow: isNeonTheme ? "0 0 15px rgba(0, 242, 255, 0.3)" : isDarkTheme ? "0 1px 3px rgba(0, 0, 0, 0.2)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: "1rem", 
          zIndex: 10, 
          position: "relative", 
        }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={
              isNeonTheme 
                ? "font-bold text-[#00f2ff] text-shadow-[0_0_5px_rgba(0,242,255,0.7)]"
                : isDarkTheme
                  ? "font-bold text-white"
                  : "font-bold text-gray-800"
            }>Voorvertoning</h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant={previewMode === "desktop" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPreviewMode("desktop")}
                className={
                  isNeonTheme
                    ? (previewMode === "desktop" 
                      ? "bg-[#190061] text-[#00f2ff] border border-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.5)]" 
                      : "bg-transparent text-[#00f2ff] border border-[#00f2ff] hover:bg-[#190061] hover:shadow-[0_0_8px_rgba(0,242,255,0.5)]")
                    : isDarkTheme
                      ? (previewMode === "desktop"
                        ? "bg-gray-700 text-white border border-gray-600" 
                        : "bg-transparent text-white border border-gray-600 hover:bg-gray-700")
                      : (previewMode === "desktop"
                        ? "bg-blue-500 text-white border border-blue-600" 
                        : "bg-transparent text-gray-800 border border-gray-300 hover:bg-gray-100")
                }
              >
                Desktop
              </Button>
              <Button 
                variant={previewMode === "mobile" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPreviewMode("mobile")}
                className={
                  isNeonTheme
                    ? (previewMode === "mobile" 
                      ? "bg-[#190061] text-[#00f2ff] border border-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.5)]" 
                      : "bg-transparent text-[#00f2ff] border border-[#00f2ff] hover:bg-[#190061] hover:shadow-[0_0_8px_rgba(0,242,255,0.5)]")
                    : isDarkTheme
                      ? (previewMode === "mobile"
                        ? "bg-gray-700 text-white border border-gray-600" 
                        : "bg-transparent text-white border border-gray-600 hover:bg-gray-700")
                      : (previewMode === "mobile"
                        ? "bg-blue-500 text-white border border-blue-600" 
                        : "bg-transparent text-gray-800 border border-gray-300 hover:bg-gray-100")
                }
              >
                Mobiel
              </Button>
            </div>
          </div>
          
          <div style={{
            transition: "all 300ms", 
            backgroundColor: isNeonTheme ? "#0c0032" : isDarkTheme ? "#000000" : "#ffffff", 
            borderRadius: "0.5rem", 
            margin: "0 auto", 
            overflow: "auto", 
            border: isNeonTheme ? "1px solid #00f2ff" : isDarkTheme ? "1px solid #333333" : "1px solid #e5e7eb",
            boxShadow: isNeonTheme ? "0 0 15px rgba(0, 242, 255, 0.3)" : isDarkTheme ? "0 1px 3px rgba(0, 0, 0, 0.2)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
            padding: previewMode === "desktop" ? "1rem" : "0.5rem",
            width: previewMode === "desktop" ? "100%" : "384px", // max-w-sm equiv
            zIndex: 20,
            position: "relative",
          }}>
            <EnhancedDragDropPreview
              text={currentQuestion.text || "Sleep de juiste termen naar de beschrijving"}
              items={items}
              dropZones={dropZones}
              dropZoneSettings={dropZoneSettings}
              mediaUrl={currentQuestion.mediaUrl}
              imageSize={currentQuestion.imageSize}
            />
          </div>
          
          <div className={
            isNeonTheme 
              ? "mt-4 text-sm text-[#00f2ff]"
              : isDarkTheme
                ? "mt-4 text-sm text-gray-300"
                : "mt-4 text-sm text-gray-600"
          }>
            <p>Dit is een live voorvertoning van hoe de vraag eruit zal zien voor leerlingen.</p>
            <p>Je kunt de vraag testen door items te slepen en op 'Controleer' te klikken.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const EnhancedDragDropQuestionEditor = withBaseQuestionEditor(EnhancedDragDropQuestionEditorBase);