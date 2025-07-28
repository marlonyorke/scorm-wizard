import { 
  Trash2, 
  Plus, 
  Crosshair, 
  Move, 
  Square, 
  Circle, 
  Polygon, 
  Target, 
  Pencil, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Eye,
  EyeOff,
  RotateCw,
  ArrowUpDown,
  ArrowLeftRight,
  Maximize,
  Minimize,
  Copy,
} from "lucide-react";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { HotspotPreview } from "../../questions/preview/HotspotPreview";
import { EditableText } from "../form/EditableText";
import { FeedbackPanel } from "../form/FeedbackPanel";
import { MediaUpload } from "../form/MediaUpload";
import type { ValidationError } from "../question-editors/base/BaseQuestionEditor";
import { withBaseQuestionEditor } from "../question-editors/base/BaseQuestionEditor";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { Question, Hotspot} from "@/types/editor";
import { HotspotDefinition, HotspotSettings } from "@/types/editor";





interface HotspotQuestionEditorProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
  validateQuestion?: (question: Question) => ValidationError[];
  showNameField?: boolean;
}

function HotspotQuestionEditorBase({
  currentQuestion,
  onQuestionChange,
}: HotspotQuestionEditorProps) {
  // State en refs
  const [activeTab, setActiveTab] = useState("basic");
  const [activeElementsTab, setActiveElementsTab] = useState<"hotspots" | "definitions">("hotspots");
  const [activeTool, setActiveTool] = useState<"rectangle" | "circle" | "polygon" | "point">("rectangle");
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{x: number, y: number} | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<{x: number, y: number}[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{x: number, y: number} | null>(null);
  const [dragOffset, setDragOffset] = useState<{x: number, y: number} | null>(null);
  
  const workspaceRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Zorg ervoor dat er altijd een hotspots array is
  const hotspots = currentQuestion.hotspots || [];
  
  // Zorg ervoor dat er altijd een definitions array is
  const definitions = currentQuestion.definitions || [];
  
  // State voor definitie bewerkingen
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(null);
  
  // Wanneer currentQuestion verandert, herstellen we de editor state
  useEffect(() => {
    if (!currentQuestion.hotspots?.length) {
      setSelectedHotspot(null);
    }
  }, [currentQuestion]);
  
  // Helper functie om SVG coördinaten rechtstreeks te krijgen ten opzichte van de afbeelding
  const getSvgPoint = (e: React.MouseEvent): {x: number, y: number} => {
    if (!imageRef.current) {
      return {x: 0, y: 0};
    }
    
    // Get the DOM element for the SVG
    const svg = e.currentTarget.querySelector("svg");
    if (!svg) {
      return {x: 0, y: 0};
    }
    
    // Create a point in the SVG coordinate system
    const point = new DOMPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    
    // Convert to the SVG's coordinate system
    const svgElement = svg as SVGSVGElement;
    const matrix = svgElement.getScreenCTM();
    if (!matrix) {
      return {x: 0, y: 0};
    }
    
    const transformedPoint = point.matrixTransform(matrix.inverse());
    
    return {
      x: transformedPoint.x,
      y: transformedPoint.y,
    };
  };

  const handleQuestionTextChange = (newText: string) => {
    onQuestionChange({
      ...currentQuestion,
      text: newText,
    });
  };

  const handleMediaChange = (mediaUrl: string | undefined, imageSize?: { width: number; height: number }) => {
    onQuestionChange({
      ...currentQuestion,
      mediaUrl,
      imageSize,
      hotspots: [], // Reset hotspots wanneer afbeelding verandert
    });
    setSelectedHotspot(null);
  };

  const handleToolChange = (tool: "rectangle" | "circle" | "polygon" | "point") => {
    setActiveTool(tool);
    setSelectedHotspot(null);
    setPolygonPoints([]);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const resetZoom = () => {
    setZoom(100);
  };

  const getRelativeCoordinates = (e: React.MouseEvent): {x: number, y: number} => {
    if (!imageRef.current) {
      return {x: 0, y: 0};
    }
    
    // Get element that was clicked
    const target = e.currentTarget as HTMLElement;
    
    // Get the bounding client rect for the image
    const imageRect = imageRef.current.getBoundingClientRect();
    
    // Calculate scaling factors based on natural vs displayed image dimensions
    const scaleFactorX = imageRef.current.naturalWidth / imageRect.width;
    const scaleFactorY = imageRef.current.naturalHeight / imageRect.height;
    
    // Get exact mouse position relative to the viewport
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate position within the image element
    const imageX = mouseX - imageRect.left;
    const imageY = mouseY - imageRect.top;
    
    // Check if click is within image bounds
    if (imageX < 0 || imageY < 0 || imageX > imageRect.width || imageY > imageRect.height) {
      console.warn("Click outside image bounds!");
    }
    
    // Convert to coordinates in the original image dimensions
    // Use exact displayed dimensions for the SVG overlay
    const x = imageX;
    const y = imageY;
    
    console.log("Debug coordinates:", { 
      mouseX, mouseY,
      imageRect: { 
        left: imageRect.left,
        top: imageRect.top, 
        width: imageRect.width, 
        height: imageRect.height, 
      },
      imageX, imageY,
      x, y,
    });
    
    return { x, y };
  };

  const handleWorkspaceMouseDown = (e: React.MouseEvent) => {
    // Voorkom dat het event bubbelt naar parent elementen
    e.stopPropagation();
    e.preventDefault();
    
    if (!currentQuestion.mediaUrl) {
      console.error("No media URL available");
      return;
    }
    
    console.log("Mouse down event triggered on:", e.target);
    
    // Als een hotspot wordt gesleept, geen nieuwe maken
    if (isDragging) {
      return;
    }
    
    // Als er al een hotspot geselecteerd is, deselect deze eerst
    if (selectedHotspot && !isDragging) {
      setSelectedHotspot(null);
    }
    
    // Een eenvoudigere manier om de coördinaten te verkrijgen
    // We gebruiken de offsetX en offsetY eigenschappen van het event
    // Deze zijn al relatief ten opzichte van het element waar de event op plaatsvond
    const coords = { 
      x: e.nativeEvent.offsetX, 
      y: e.nativeEvent.offsetY, 
    };
    
    console.log("Mouse down at coordinates:", coords);
    
    // Speciale case voor 'point' tool: direct een hotspot maken
    if (activeTool === "point") {
      console.log("Creating point hotspot at:", coords);
      const id = crypto.randomUUID();
      const newHotspot: Hotspot = {
        id,
        name: `Punt ${hotspots.length + 1}`,
        isCorrect: true,
        shape: "point",
        coordinates: {
          x: coords.x,
          y: coords.y,
        },
        feedback: "",
        points: 1,
      };
      
      // Direct toevoegen aan de vraag
      onQuestionChange({
        ...currentQuestion,
        hotspots: [...hotspots, newHotspot],
      });
      setSelectedHotspot(id);
      return;
    } 
    
    // Voor polygon: punten toevoegen bij elke klik
    if (activeTool === "polygon") {
      setPolygonPoints([...polygonPoints, coords]);
      console.log("Added point to polygon, now have", polygonPoints.length + 1, "points");
      
      // Als we dubbel klikken en minimaal 3 punten hebben, maken we de polygon af
      if (e.detail === 2 && polygonPoints.length >= 2) {
        console.log("Double click detected, creating polygon");
        const id = crypto.randomUUID();
        const allPoints = [...polygonPoints, coords];
        const newHotspot: Hotspot = {
          id,
          name: `Veelhoek ${hotspots.length + 1}`,
          isCorrect: true,
          shape: "polygon",
          coordinates: {
            x: allPoints[0].x,
            y: allPoints[0].y,
            points: allPoints,
          },
          feedback: "",
          points: 1,
        };
        
        // Direct toevoegen aan de vraag
        onQuestionChange({
          ...currentQuestion,
          hotspots: [...hotspots, newHotspot],
        });
        setSelectedHotspot(id);
        setPolygonPoints([]);
      }
      return;
    }
    
    // Voor rechthoek en cirkel het startpunt opslaan
    setIsDrawing(true);
    setStartPoint(coords);
    console.log("Starting to draw shape at:", coords);
  };

  const handleWorkspaceMouseMove = (e: React.MouseEvent) => {
    // Voorkom dat het event bubbelt naar parent elementen
    e.stopPropagation();
    
    if (!isDrawing || !startPoint) {
      return;
    }
    
    // Gebruik offsetX en offsetY voor consistentie met mousedown
    const currentCoords = { 
      x: e.nativeEvent.offsetX, 
      y: e.nativeEvent.offsetY, 
    };
    
    setCurrentPoint(currentCoords);
    
    console.log("Mouse move at:", currentCoords);
  };

  const handleWorkspaceMouseUp = (e: React.MouseEvent) => {
    // Voorkom dat het event bubbelt naar parent elementen
    e.stopPropagation();
    e.preventDefault();
    
    if (!isDrawing || !startPoint) {
      console.log("Not drawing or no start point", isDrawing, startPoint);
      return;
    }
    
    // Gebruik offsetX en offsetY voor consistentie
    const endPoint = { 
      x: e.nativeEvent.offsetX, 
      y: e.nativeEvent.offsetY, 
    };
    
    console.log("Mouse up at coordinates:", endPoint);
    
    // Maak de juiste hotspot op basis van het actieve gereedschap
    if (activeTool === "rectangle") {
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);
      
      if (width < 5 || height < 5) {
        console.log("Rectangle too small, ignoring");
        setIsDrawing(false);
        setStartPoint(null);
        return;
      }
      
      console.log("Creating rectangle from", startPoint, "to", endPoint);
      const id = crypto.randomUUID();
      const newHotspot: Hotspot = {
        id,
        name: `Rechthoek ${hotspots.length + 1}`,
        isCorrect: true,
        shape: "rectangle",
        coordinates: {
          x: Math.min(startPoint.x, endPoint.x),
          y: Math.min(startPoint.y, endPoint.y),
          width: width,
          height: height,
        },
        feedback: "",
        points: 1,
      };
      
      // Direct toevoegen aan de vraag
      onQuestionChange({
        ...currentQuestion,
        hotspots: [...hotspots, newHotspot],
      });
      setSelectedHotspot(id);
      
    } else if (activeTool === "circle") {
      const dx = endPoint.x - startPoint.x;
      const dy = endPoint.y - startPoint.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      
      if (radius < 5) {
        console.log("Circle too small, ignoring");
        setIsDrawing(false);
        setStartPoint(null);
        return;
      }
      
      console.log("Creating circle at", startPoint, "with radius", radius);
      const id = crypto.randomUUID();
      const newHotspot: Hotspot = {
        id,
        name: `Cirkel ${hotspots.length + 1}`,
        isCorrect: true,
        shape: "circle",
        coordinates: {
          x: startPoint.x,
          y: startPoint.y,
          radius: radius,
        },
        feedback: "",
        points: 1,
      };
      
      // Direct toevoegen aan de vraag
      onQuestionChange({
        ...currentQuestion,
        hotspots: [...hotspots, newHotspot],
      });
      setSelectedHotspot(id);
    }
    
    // Reset de teken-status
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
  };

  // Deze functie is nu overbodig omdat we de hotspots direct aanmaken in de handlers

  const deleteHotspot = (id: string) => {
    const updatedHotspots = hotspots.filter((h) => h.id !== id);
    
    onQuestionChange({
      ...currentQuestion,
      hotspots: updatedHotspots,
    });
    
    if (selectedHotspot === id) {
      setSelectedHotspot(null);
    }
  };

  const updateHotspot = (id: string, updates: Partial<Hotspot>) => {
    const updatedHotspots = hotspots.map((h) => 
      h.id === id ? { ...h, ...updates } : h,
    );
    
    onQuestionChange({
      ...currentQuestion,
      hotspots: updatedHotspots,
    });
  };
  
  const toggleHotspotAsDropZone = (id: string) => {
    const hotspot = hotspots.find((h) => h.id === id);
    if (!hotspot) {
      return;
    }
    
    // Toggle de isDropZone eigenschap
    updateHotspot(id, { isDropZone: !hotspot.isDropZone });
    
    // Zorg dat labelingMode is ingeschakeld in de hotspotSettings
    if (!currentQuestion.hotspotSettings?.labelingMode) {
      onQuestionChange({
        ...currentQuestion,
        hotspotSettings: {
          ...currentQuestion.hotspotSettings,
          labelingMode: true,
          dropZoneOpacity: currentQuestion.hotspotSettings?.dropZoneOpacity || 50, // Standaard 50% transparantie
          snapToPlaceDistance: currentQuestion.hotspotSettings?.snapToPlaceDistance || 15, // Standaard 15px snap afstand
          partialScoring: currentQuestion.hotspotSettings?.partialScoring || true, // Standaard gedeeltelijke scoring ingeschakeld
        },
      });
    }
  };

  const getSelectedHotspot = () => {
    return hotspots.find((h) => h.id === selectedHotspot);
  };
  
  // Functies voor het beheren van definities
  const addDefinition = () => {
    const newDefinition: Definition = {
      id: crypto.randomUUID(),
      number: definitions.length + 1,
      text: `Definitie ${definitions.length + 1}`,
      correctHotspotId: "",
    };
    
    onQuestionChange({
      ...currentQuestion,
      definitions: [...definitions, newDefinition],
    });
    
    setSelectedDefinition(newDefinition.id);
  };
  
  const updateDefinition = (id: string, updates: Partial<Definition>) => {
    const updatedDefinitions = definitions.map((d) => 
      d.id === id ? { ...d, ...updates } : d,
    );
    
    onQuestionChange({
      ...currentQuestion,
      definitions: updatedDefinitions,
    });
  };
  
  const deleteDefinition = (id: string) => {
    const updatedDefinitions = definitions.filter((d) => d.id !== id);
    
    // Hernummer de definities
    const reindexedDefinitions = updatedDefinitions.map((def, index) => ({
      ...def,
      number: index + 1,
    }));
    
    onQuestionChange({
      ...currentQuestion,
      definitions: reindexedDefinitions,
    });
    
    if (selectedDefinition === id) {
      setSelectedDefinition(null);
    }
  };
  
  const getSelectedDefinition = () => {
    return definitions.find((d) => d.id === selectedDefinition);
  };

  const handleStartDragging = (e: React.MouseEvent, hotspot: Hotspot) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log("Starting to drag hotspot:", hotspot.id);
    
    // Markeer dat we beginnen met slepen
    setIsDragging(true);
    setSelectedHotspot(hotspot.id);
    
    // Onthoud waar we beginnen met slepen
    const mousePos = { 
      x: e.nativeEvent.offsetX, 
      y: e.nativeEvent.offsetY, 
    };
    setDragStartPos(mousePos);
    
    // Bereken offset tussen muis en hotspot centrum/positie
    // Dit is afhankelijk van het type hotspot
    let offsetX = 0;
    let offsetY = 0;
    
    switch(hotspot.shape) {
      case "rectangle":
        // Voor rechthoek: offset tov linksboven
        offsetX = mousePos.x - hotspot.coordinates.x;
        offsetY = mousePos.y - hotspot.coordinates.y;
        break;
      case "circle":
      case "point":
        // Voor cirkel/punt: offset tov middelpunt
        offsetX = mousePos.x - hotspot.coordinates.x;
        offsetY = mousePos.y - hotspot.coordinates.y;
        break;
      case "polygon":
        // Voor polygon: offset tov eerste punt (kan later verbeterd worden)
        offsetX = mousePos.x - hotspot.coordinates.x;
        offsetY = mousePos.y - hotspot.coordinates.y;
        break;
    }
    
    setDragOffset({ x: offsetX, y: offsetY });
  };
  
  const handleDragging = (e: React.MouseEvent) => {
    if (!isDragging || !selectedHotspot || !dragOffset) {
      return;
    }
    
    e.stopPropagation();
    e.preventDefault();
    
    const currentHotspot = hotspots.find((h) => h.id === selectedHotspot);
    if (!currentHotspot) {
      return;
    }
    
    // Bereken nieuwe positie
    const newX = e.nativeEvent.offsetX - dragOffset.x;
    const newY = e.nativeEvent.offsetY - dragOffset.y;
    
    // Update de hotspot positie afhankelijk van het type
    let updatedCoordinates = { ...currentHotspot.coordinates };
    
    switch(currentHotspot.shape) {
      case "rectangle":
        // Voor rechthoek: verplaats linksboven punt
        updatedCoordinates = {
          ...updatedCoordinates,
          x: newX,
          y: newY,
        };
        break;
      case "circle":
      case "point":
        // Voor cirkel/punt: verplaats middelpunt
        updatedCoordinates = {
          ...updatedCoordinates,
          x: newX,
          y: newY,
        };
        break;
      case "polygon":
        // Voor polygon: verplaats alle punten
        if (updatedCoordinates.points) {
          const deltaX = newX - currentHotspot.coordinates.x;
          const deltaY = newY - currentHotspot.coordinates.y;
          
          updatedCoordinates = {
            ...updatedCoordinates,
            x: newX,
            y: newY,
            points: updatedCoordinates.points.map((point) => ({
              x: point.x + deltaX,
              y: point.y + deltaY,
            })),
          };
        }
        break;
    }
    
    // Update de hotspot met de nieuwe positie
    const updatedHotspots = hotspots.map((h) => 
      h.id === selectedHotspot 
        ? { ...h, coordinates: updatedCoordinates } 
        : h,
    );
    
    onQuestionChange({
      ...currentQuestion,
      hotspots: updatedHotspots,
    });
  };
  
  const handleEndDragging = () => {
    setIsDragging(false);
    setDragStartPos(null);
    setDragOffset(null);
    // We laten selectedHotspot staan zodat de gebruiker ziet welke hotspot geselecteerd is
  };

  const renderSVGHotspots = () => {
    if (!imageRef.current) {
      return null;
    }
    
    // Gebruik de actuele weergavegrootte, niet de natuurlijke grootte
    const imageWidth = imageRef.current.clientWidth;
    const imageHeight = imageRef.current.clientHeight;
    
    console.log("Rendering SVG with dimensions:", { imageWidth, imageHeight });
    
    return (
      <svg 
        width={imageWidth} 
        height={imageHeight} 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        onMouseMove={handleDragging}
        onMouseUp={handleEndDragging}
        onMouseLeave={handleEndDragging}
      >
        {/* Rendering van de preview tijdens het tekenen */}
        {isDrawing && startPoint && currentPoint && (
          <>
            {activeTool === "rectangle" && (
              <rect
                x={Math.min(startPoint.x, currentPoint.x)}
                y={Math.min(startPoint.y, currentPoint.y)}
                width={Math.abs(currentPoint.x - startPoint.x)}
                height={Math.abs(currentPoint.y - startPoint.y)}
                fill="rgba(59, 130, 246, 0.2)"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
            
            {activeTool === "circle" && (
              <circle
                cx={startPoint.x}
                cy={startPoint.y}
                r={Math.sqrt(
                  Math.pow(currentPoint.x - startPoint.x, 2) + 
                  Math.pow(currentPoint.y - startPoint.y, 2),
                )}
                fill="rgba(59, 130, 246, 0.2)"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </>
        )}
        
        {/* Rendering van bestaande polygon punten tijdens het tekenen */}
        {activeTool === "polygon" && polygonPoints.length > 0 && (
          <>
            <polyline
              points={polygonPoints.map((point) => `${point.x},${point.y}`).join(" ")}
              fill="none"
              stroke="rgba(59, 130, 246, 0.8)"
              strokeWidth={2}
              strokeDasharray="5,5"
            />
            {polygonPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={5}
                fill="rgba(59, 130, 246, 0.5)"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth={2}
              />
            ))}
          </>
        )}
        
        {/* Rendering van bestaande hotspots */}
        {hotspots.map((hotspot) => {
          const isSelected = hotspot.id === selectedHotspot;
          const isBeingDragged = isSelected && isDragging;
          let shape = null;
          
          switch(hotspot.shape) {
            case "rectangle":
              shape = (
                <rect
                  x={hotspot.coordinates.x}
                  y={hotspot.coordinates.y}
                  width={hotspot.coordinates.width || 0}
                  height={hotspot.coordinates.height || 0}
                  fill={
                    hotspot.isDropZone
                      ? (isSelected ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.15)")
                      : (isSelected ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.15)")
                  }
                  stroke={
                    isBeingDragged 
                      ? "#FFB800" 
                      : (hotspot.isDropZone
                        ? (isSelected ? "#10b981" : "rgba(16, 185, 129, 0.6)")
                        : (isSelected ? "#3b82f6" : "rgba(59, 130, 246, 0.5)"))
                  }
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray={isBeingDragged ? "4,2" : (hotspot.isDropZone ? "5,2" : "none")}
                  style={{ cursor: "move", pointerEvents: "auto" }}
                  onMouseDown={(e) => handleStartDragging(e, hotspot)}
                />
              );
              break;
              
            case "circle":
              shape = (
                <circle
                  cx={hotspot.coordinates.x}
                  cy={hotspot.coordinates.y}
                  r={hotspot.coordinates.radius || 0}
                  fill={
                    hotspot.isDropZone
                      ? (isSelected ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.15)")
                      : (isSelected ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.15)")
                  }
                  stroke={
                    isBeingDragged 
                      ? "#FFB800" 
                      : (hotspot.isDropZone
                        ? (isSelected ? "#10b981" : "rgba(16, 185, 129, 0.6)")
                        : (isSelected ? "#3b82f6" : "rgba(59, 130, 246, 0.5)"))
                  }
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray={isBeingDragged ? "4,2" : (hotspot.isDropZone ? "5,2" : "none")}
                  style={{ cursor: "move", pointerEvents: "auto" }}
                  onMouseDown={(e) => handleStartDragging(e, hotspot)}
                />
              );
              break;
              
            case "point":
              shape = (
                <circle
                  cx={hotspot.coordinates.x}
                  cy={hotspot.coordinates.y}
                  r={10}
                  fill={
                    hotspot.isDropZone
                      ? (isSelected ? "rgba(16, 185, 129, 0.7)" : "rgba(16, 185, 129, 0.4)")
                      : (isSelected ? "rgba(59, 130, 246, 0.7)" : "rgba(59, 130, 246, 0.4)")
                  }
                  stroke={
                    isBeingDragged 
                      ? "#FFB800" 
                      : (hotspot.isDropZone
                        ? (isSelected ? "#10b981" : "rgba(16, 185, 129, 0.6)")
                        : (isSelected ? "#3b82f6" : "rgba(59, 130, 246, 0.5)"))
                  }
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray={isBeingDragged ? "4,2" : (hotspot.isDropZone ? "5,2" : "none")}
                  style={{ cursor: "move", pointerEvents: "auto" }}
                  onMouseDown={(e) => handleStartDragging(e, hotspot)}
                />
              );
              break;
              
            case "polygon":
              if (hotspot.coordinates.points && hotspot.coordinates.points.length > 2) {
                const pointsString = hotspot.coordinates.points
                  .map((point) => `${point.x},${point.y}`)
                  .join(" ");
                
                shape = (
                  <polygon
                    points={pointsString}
                    fill={
                      hotspot.isDropZone
                        ? (isSelected ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.15)")
                        : (isSelected ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.15)")
                    }
                    stroke={
                      isBeingDragged 
                        ? "#FFB800" 
                        : (hotspot.isDropZone
                          ? (isSelected ? "#10b981" : "rgba(16, 185, 129, 0.6)")
                          : (isSelected ? "#3b82f6" : "rgba(59, 130, 246, 0.5)"))
                    }
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray={isBeingDragged ? "4,2" : (hotspot.isDropZone ? "5,2" : "none")}
                    style={{ cursor: "move", pointerEvents: "auto" }}
                    onMouseDown={(e) => handleStartDragging(e, hotspot)}
                  />
                );
              }
              break;
          }
          
          return (
            <g 
              key={hotspot.id} 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHotspot(hotspot.id);
              }}
            >
              {shape}
              {isSelected && isBeingDragged && (
                <>
                  {hotspot.shape === "rectangle" && (
                    <rect
                      x={hotspot.coordinates.x - 2}
                      y={hotspot.coordinates.y - 2}
                      width={(hotspot.coordinates.width || 0) + 4}
                      height={(hotspot.coordinates.height || 0) + 4}
                      fill="none"
                      stroke="#FFB800"
                      strokeWidth={1}
                      strokeDasharray="2,2"
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                  {hotspot.shape === "circle" && (
                    <circle
                      cx={hotspot.coordinates.x}
                      cy={hotspot.coordinates.y}
                      r={(hotspot.coordinates.radius || 0) + 2}
                      fill="none"
                      stroke="#FFB800"
                      strokeWidth={1}
                      strokeDasharray="2,2"
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                  {hotspot.shape === "polygon" && hotspot.coordinates.points && hotspot.coordinates.points.length > 2 && (
                    <polygon
                      points={hotspot.coordinates.points.map((point) => `${point.x},${point.y}`).join(" ")}
                      fill="none"
                      stroke="#FFB800"
                      strokeWidth={1}
                      strokeDasharray="2,2"
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                </>
              )}
              <text
                x={
                  hotspot.shape === "rectangle" ? 
                    hotspot.coordinates.x + (hotspot.coordinates.width || 0) / 2 : 
                    hotspot.coordinates.x
                }
                y={
                  hotspot.shape === "rectangle" ? 
                    hotspot.coordinates.y + (hotspot.coordinates.height || 0) / 2 : 
                    hotspot.coordinates.y - 15
                }
                textAnchor="middle"
                fill={hotspot.isCorrect ? "#16a34a" : "#e11d48"}
                fontSize="12"
                fontWeight="bold"
                pointerEvents="none"
              >
                {hotspot.name}
                {isBeingDragged && " (verplaatsen...)"}
                {hotspot.isDropZone && " 🎯"}
              </text>
            </g>
          );
        })}
        
        {/* Teken actieve polygon punten tijdens het maken */}
        {activeTool === "polygon" && polygonPoints.length > 0 && (
          <g>
            {polygonPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={5}
                fill="rgba(59, 130, 246, 0.7)"
              />
            ))}
            {polygonPoints.length > 1 && (
              <polyline
                points={polygonPoints.map((point) => `${point.x},${point.y}`).join(" ")}
                fill="none"
                stroke="rgba(59, 130, 246, 0.7)"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </g>
        )}
      </svg>
    );
  };

  const handleFeedbackChange = (feedback: string) => {
    onQuestionChange({
      ...currentQuestion,
      feedback,
    });
  };

  const handleCorrectFeedbackChange = (correctFeedback: string) => {
    onQuestionChange({
      ...currentQuestion,
      correctFeedback,
    });
  };

  const handleIncorrectFeedbackChange = (incorrectFeedback: string) => {
    onQuestionChange({
      ...currentQuestion,
      incorrectFeedback,
    });
  };

  const handleFeedbackImageChange = (feedbackImageUrl: string | undefined) => {
    onQuestionChange({
      ...currentQuestion,
      feedbackImageUrl,
    });
  };

  const handleCorrectFeedbackImageChange = (correctFeedbackImageUrl: string | undefined) => {
    onQuestionChange({
      ...currentQuestion,
      correctFeedbackImageUrl,
    });
  };

  const handleIncorrectFeedbackImageChange = (incorrectFeedbackImageUrl: string | undefined) => {
    onQuestionChange({
      ...currentQuestion,
      incorrectFeedbackImageUrl,
    });
  };

  return (
    <div className="flex flex-col w-full h-full min-h-[80vh] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      {/* Header met titel en acties */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold">Hotspot Vraag Editor</h2>
        <div className="flex gap-2">
          <Button variant="outline">Annuleren</Button>
          <Button>Opslaan</Button>
        </div>
      </div>
      
      {/* Tabbladen voor verschillende secties */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="basic">Basisgegevens</TabsTrigger>
          <TabsTrigger value="elements">Elementen</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="settings">Instellingen</TabsTrigger>
          <TabsTrigger value="preview">Voorvertoning</TabsTrigger>
        </TabsList>
        
        {/* Basis tab met vraag en media upload */}
        <TabsContent value="basic" className="flex-1 p-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question-text">Vraag</Label>
              <EditableText
                value={currentQuestion.text}
                onSave={handleQuestionTextChange}
                placeholder="Typ hier je vraag..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Afbeelding</Label>
              <MediaUpload 
                media={currentQuestion.mediaUrl}
                imageSize={currentQuestion.imageSize}
                onMediaChange={handleMediaChange}
              />
              <p className="text-sm text-gray-500">Upload een afbeelding om hotspots op te plaatsen.</p>
            </div>
          </div>
        </TabsContent>
        
        {/* Gecombineerd Elementen tabblad voor hotspots en definities */}
        <TabsContent value="elements" className="flex-1 flex flex-col">
          {!currentQuestion.mediaUrl ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <p className="mb-4">Upload eerst een afbeelding in het 'Basisgegevens' tabblad.</p>
                <Button onClick={() => setActiveTab("basic")}>Ga naar Basisgegevens</Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Tabs voor Hotspots en Definities */}
              <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium",
                    activeElementsTab === "hotspots" ? 
                      "border-b-2 border-primary text-primary" : 
                      "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                  )}
                  onClick={() => setActiveElementsTab("hotspots")}
                >
                  Hotspots
                </button>
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium",
                    activeElementsTab === "definitions" ? 
                      "border-b-2 border-primary text-primary" : 
                      "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                  )}
                  onClick={() => setActiveElementsTab("definitions")}
                >
                  Definities
                </button>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row">
                {/* Linker kolom */}
                <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-800 p-4 space-y-6">
                  {activeElementsTab === "hotspots" ? (
                    <>
                      {/* Gereedschappen voor hotspots */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Tekengereedschap</h3>
                        <RadioGroup 
                          value={activeTool} 
                          onValueChange={(value) => handleToolChange(value as "rectangle" | "circle" | "polygon" | "point")}
                          className="grid grid-cols-2 gap-2"
                        >
                          <div className={cn(
                            "flex items-center justify-center border rounded-md p-2 cursor-pointer",
                            activeTool === "rectangle" && "bg-primary text-primary-foreground",
                          )}>
                            <RadioGroupItem value="rectangle" id="rectangle" className="sr-only" />
                            <Label htmlFor="rectangle" className="flex flex-col items-center cursor-pointer">
                              <Square className="mb-1" size={18} />
                              <span>Rechthoek</span>
                            </Label>
                          </div>
                          <div className={cn(
                            "flex items-center justify-center border rounded-md p-2 cursor-pointer",
                            activeTool === "circle" && "bg-primary text-primary-foreground",
                          )}>
                            <RadioGroupItem value="circle" id="circle" className="sr-only" />
                            <Label htmlFor="circle" className="flex flex-col items-center cursor-pointer">
                              <Circle className="mb-1" size={18} />
                              <span>Cirkel</span>
                            </Label>
                          </div>
                          <div className={cn(
                            "flex items-center justify-center border rounded-md p-2 cursor-pointer",
                            activeTool === "polygon" && "bg-primary text-primary-foreground",
                          )}>
                            <RadioGroupItem value="polygon" id="polygon" className="sr-only" />
                            <Label htmlFor="polygon" className="flex flex-col items-center cursor-pointer">
                              <Pentagon className="mb-1" size={18} />
                              <span>Veelhoek</span>
                            </Label>
                          </div>
                          <div className={cn(
                            "flex items-center justify-center border rounded-md p-2 cursor-pointer",
                            activeTool === "point" && "bg-primary text-primary-foreground",
                          )}>
                            <RadioGroupItem value="point" id="point" className="sr-only" />
                            <Label htmlFor="point" className="flex flex-col items-center cursor-pointer">
                              <MousePointer className="mb-1" size={18} />
                              <span>Punt</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {/* Hotspot lijst */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Hotspot Lijst</h3>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Reset selectie om een nieuwe hotspot te maken
                              setSelectedHotspot(null);
                              // Standaard rechthoek tool selecteren
                              setActiveTool("rectangle");
                            }}
                          >
                            <Plus size={16} className="mr-1" /> Nieuwe
                          </Button>
                        </div>
                        
                        <div className="border rounded-md overflow-hidden">
                          {hotspots.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              <p>Geen hotspots toegevoegd.</p>
                              <p className="text-sm">Gebruik de gereedschappen om hotspots toe te voegen.</p>
                            </div>
                          ) : (
                            <div className="max-h-[300px] overflow-y-auto">
                              {hotspots.map((hotspot) => (
                                <div 
                                  key={hotspot.id}
                                  className={cn(
                                    "flex items-center justify-between p-2 border-b last:border-0 cursor-pointer",
                                    selectedHotspot === hotspot.id && "bg-primary/10",
                                  )}
                                  onClick={() => {
                                    setSelectedHotspot(hotspot.id);
                                    setSelectedDefinition(null);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className={cn(
                                        "w-3 h-3 rounded-full",
                                        hotspot.isCorrect ? "bg-green-500" : "bg-red-500",
                                      )}
                                    />
                                    <span>{hotspot.name}</span>
                                    {hotspot.isDropZone && <span className="text-xs bg-green-100 text-green-800 rounded-full px-1.5 py-0.5">Drop zone</span>}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteHotspot(hotspot.id);
                                    }}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Definities lijsten en opties */
                    <>
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Definities</h3>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Schakel labeling mode in als deze nog niet aan stond
                            if (!currentQuestion.hotspotSettings?.labelingMode) {
                              onQuestionChange({
                                ...currentQuestion,
                                hotspotSettings: {
                                  ...currentQuestion.hotspotSettings,
                                  labelingMode: true,
                                  dropZoneOpacity: currentQuestion.hotspotSettings?.dropZoneOpacity || 50,
                                  snapToPlaceDistance: currentQuestion.hotspotSettings?.snapToPlaceDistance || 15,
                                  partialScoring: currentQuestion.hotspotSettings?.partialScoring !== false,
                                },
                              });
                            }
                            addDefinition();
                          }}
                        >
                          <Plus size={16} className="mr-1" /> Nieuwe
                        </Button>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        {definitions.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <p>Geen definities toegevoegd.</p>
                            <p className="text-sm">Klik op 'Nieuwe' om definities toe te voegen.</p>
                          </div>
                        ) : (
                          <div className="max-h-[300px] overflow-y-auto">
                            {definitions.map((definition) => (
                              <div 
                                key={definition.id}
                                className={cn(
                                  "flex items-center justify-between p-2 border-b last:border-0 cursor-pointer",
                                  selectedDefinition === definition.id && "bg-primary/10",
                                )}
                                onClick={() => {
                                  setSelectedDefinition(definition.id);
                                  setSelectedHotspot(null);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                    {definition.number}
                                  </div>
                                  <span className="truncate">{definition.text}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteDefinition(definition.id);
                                  }}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium">Dropzones</h4>
                        <div className="text-sm text-gray-600">
                          {hotspots.filter((h) => h.isDropZone).length === 0 ? (
                            <div className="p-3 bg-yellow-50 text-yellow-800 rounded border border-yellow-200">
                              <p className="font-medium">Geen dropzones beschikbaar</p>
                              <p className="mt-1">Markeer hotspots als dropzones in het Hotspots-tabblad.</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {hotspots.filter((h) => h.isDropZone).map((hotspot) => (
                                <div key={hotspot.id} className="flex justify-between items-center p-2 bg-green-50 border border-green-100 rounded">
                                  <span>{hotspot.name}</span>
                                  <span className="text-xs text-green-600">Drop zone</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Rechter kolom met werkgebied en eigenschappen */}
                <div className="w-full md:w-2/3 p-4 flex flex-col">
                  {/* Werkbalk */}
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <div>
                      {activeElementsTab === "hotspots" ? (
                        <p className="text-sm text-gray-500">Selecteer een hotspot-type links en klik op de afbeelding om te plaatsen</p>
                      ) : (
                        <p className="text-sm text-gray-500">Definities kunnen worden gekoppeld aan hotspots die als dropzone zijn gemarkeerd</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          if (activeTab !== "preview") {
                            setActiveTab("preview");
                          } else {
                            setActiveTab("elements");
                          }
                        }}
                      >
                        <Eye size={16} className="mr-2" />
                        {activeTab === "preview" ? "Bewerken" : "Preview"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Werkgebied */}
                  <div 
                    className="relative flex-1 border rounded-md overflow-auto bg-gray-100 dark:bg-gray-900"
                    ref={workspaceRef}
                    style={{
                      minHeight: "300px",
                    }}
                  >
                    <div 
                      className="relative"
                      style={{
                        position: "relative",
                        height: "fit-content",
                        cursor: activeElementsTab === "hotspots" && activeTool === "point" ? "crosshair" : (isDrawing ? "crosshair" : "default"),
                      }}
                      onMouseDown={activeElementsTab === "hotspots" ? handleWorkspaceMouseDown : undefined}
                      onMouseMove={activeElementsTab === "hotspots" ? handleWorkspaceMouseMove : undefined}
                      onMouseUp={activeElementsTab === "hotspots" ? handleWorkspaceMouseUp : undefined}
                    >
                      {currentQuestion.mediaUrl ? (
                        <>
                          <img 
                            ref={imageRef}
                            src={currentQuestion.mediaUrl} 
                            alt="Hotspot afbeelding"
                            style={{
                              maxWidth: "100%",
                              width: "100%",
                              display: "block",
                              objectFit: "contain",
                            }}
                          />
                          {renderSVGHotspots()}
                        </>
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center">
                          <p>Geen afbeelding geüpload</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Eigenschappen panel */}
                  {activeElementsTab === "hotspots" && selectedHotspot && (
                    <div className="mt-4 border rounded-md p-4">
                      <h3 className="text-lg font-medium mb-4">Hotspot Eigenschappen</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="hotspot-name">Naam</Label>
                            <Input 
                              id="hotspot-name"
                              value={getSelectedHotspot()?.name || ""}
                              onChange={(e) => updateHotspot(selectedHotspot, { name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hotspot-status">Status</Label>
                            <Select 
                              value={getSelectedHotspot()?.isCorrect ? "correct" : "incorrect"} 
                              onValueChange={(value) => updateHotspot(selectedHotspot, { isCorrect: value === "correct" })}
                            >
                              <SelectTrigger id="hotspot-status">
                                <SelectValue placeholder="Selecteer status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="correct">Correct</SelectItem>
                                <SelectItem value="incorrect">Incorrect</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="hotspot-feedback">Feedback</Label>
                          <Textarea 
                            id="hotspot-feedback"
                            value={getSelectedHotspot()?.feedback || ""}
                            onChange={(e) => updateHotspot(selectedHotspot, { feedback: e.target.value })}
                            placeholder="Voeg feedback toe voor deze hotspot..."
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="hotspot-points">Punten</Label>
                          <Input 
                            id="hotspot-points"
                            type="number"
                            min={0}
                            value={getSelectedHotspot()?.points || 0}
                            onChange={(e) => updateHotspot(selectedHotspot, { points: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2">
                          <Switch
                            id="is-dropzone"
                            checked={getSelectedHotspot()?.isDropZone || false}
                            onCheckedChange={() => toggleHotspotAsDropZone(selectedHotspot)}
                          />
                          <Label htmlFor="is-dropzone" className="cursor-pointer">
                            Gebruik als drop zone voor definities
                          </Label>
                        </div>
                        
                        {getSelectedHotspot()?.isDropZone && (
                          <div className="pt-2 pb-1 px-3 bg-primary/5 rounded-md border border-primary/20">
                            <p className="text-sm text-primary mb-2">
                              Deze hotspot is een drop zone voor definities
                            </p>
                            <div className="text-xs flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setActiveElementsTab("definitions")}
                              >
                                Ga naar Definities
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>X-coördinaat</Label>
                            <Input 
                              type="number"
                              value={Math.round(getSelectedHotspot()?.coordinates.x || 0)}
                              onChange={(e) => {
                                const hotspot = getSelectedHotspot();
                                if (hotspot) {
                                  updateHotspot(selectedHotspot, { 
                                    coordinates: {
                                      ...hotspot.coordinates,
                                      x: parseInt(e.target.value) || 0,
                                    },
                                  });
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Y-coördinaat</Label>
                            <Input 
                              type="number"
                              value={Math.round(getSelectedHotspot()?.coordinates.y || 0)}
                              onChange={(e) => {
                                const hotspot = getSelectedHotspot();
                                if (hotspot) {
                                  updateHotspot(selectedHotspot, { 
                                    coordinates: {
                                      ...hotspot.coordinates,
                                      y: parseInt(e.target.value) || 0,
                                    },
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                        
                        {getSelectedHotspot()?.shape === "rectangle" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Breedte</Label>
                              <Input 
                                type="number"
                                min={1}
                                value={Math.round(getSelectedHotspot()?.coordinates.width || 0)}
                                onChange={(e) => {
                                  const hotspot = getSelectedHotspot();
                                  if (hotspot) {
                                    updateHotspot(selectedHotspot, { 
                                      coordinates: {
                                        ...hotspot.coordinates,
                                        width: parseInt(e.target.value) || 0,
                                      },
                                    });
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Hoogte</Label>
                              <Input 
                                type="number"
                                min={1}
                                value={Math.round(getSelectedHotspot()?.coordinates.height || 0)}
                                onChange={(e) => {
                                  const hotspot = getSelectedHotspot();
                                  if (hotspot) {
                                    updateHotspot(selectedHotspot, { 
                                      coordinates: {
                                        ...hotspot.coordinates,
                                        height: parseInt(e.target.value) || 0,
                                      },
                                    });
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {getSelectedHotspot()?.shape === "circle" && (
                          <div className="space-y-2">
                            <Label>Radius</Label>
                            <Input 
                              type="number"
                              min={1}
                              value={Math.round(getSelectedHotspot()?.coordinates.radius || 0)}
                              onChange={(e) => {
                                const hotspot = getSelectedHotspot();
                                if (hotspot) {
                                  updateHotspot(selectedHotspot, { 
                                    coordinates: {
                                      ...hotspot.coordinates,
                                      radius: parseInt(e.target.value) || 0,
                                    },
                                  });
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Definitie eigenschappen als die actief zijn */}
                  {activeElementsTab === "definitions" && selectedDefinition && (
                    <div className="mt-4 border rounded-md p-4">
                      <h3 className="text-lg font-medium mb-4">Definitie Eigenschappen</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="definition-number">Nummer</Label>
                          <Input 
                            id="definition-number"
                            type="number"
                            min={1}
                            value={getSelectedDefinition()?.number || 1}
                            onChange={(e) => updateDefinition(selectedDefinition, { 
                              number: parseInt(e.target.value) || 1, 
                            })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="definition-text">Definitietekst</Label>
                          <Textarea 
                            id="definition-text"
                            value={getSelectedDefinition()?.text || ""}
                            onChange={(e) => updateDefinition(selectedDefinition, { 
                              text: e.target.value, 
                            })}
                            placeholder="Voer de definietekst in..."
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="correct-hotspot">Correcte hotspot</Label>
                          <Select 
                            value={getSelectedDefinition()?.correctHotspotId || ""}
                            onValueChange={(value) => updateDefinition(selectedDefinition, { 
                              correctHotspotId: value, 
                            })}
                          >
                            <SelectTrigger id="correct-hotspot">
                              <SelectValue placeholder="Kies een hotspot..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">-- Geen hotspot geselecteerd --</SelectItem>
                              {hotspots
                                .filter((h) => h.isDropZone)
                                .map((hotspot) => (
                                  <SelectItem key={hotspot.id} value={hotspot.id}>
                                    {hotspot.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          
                          {hotspots.filter((h) => h.isDropZone).length === 0 && (
                            <p className="text-sm text-yellow-600 dark:text-yellow-500">
                              Er zijn nog geen hotspots als drop zone gemarkeerd. Ga naar het 'Hotspots' tabblad om een of meer hotspots als drop zone in te stellen.
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="text-md font-medium">Feedback</h4>
                          
                          <div className="space-y-2">
                            <Label htmlFor="correct-feedback">Feedback bij juiste plaatsing</Label>
                            <Textarea 
                              id="correct-feedback"
                              value={getSelectedDefinition()?.feedback?.correct || ""}
                              onChange={(e) => updateDefinition(selectedDefinition, { 
                                feedback: {
                                  ...getSelectedDefinition()?.feedback,
                                  correct: e.target.value,
                                },
                              })}
                              placeholder="Feedback bij juiste plaatsing..."
                              rows={2}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="incorrect-feedback">Feedback bij onjuiste plaatsing</Label>
                            <Textarea 
                              id="incorrect-feedback"
                              value={getSelectedDefinition()?.feedback?.incorrect || ""}
                              onChange={(e) => updateDefinition(selectedDefinition, { 
                                feedback: {
                                  ...getSelectedDefinition()?.feedback,
                                  incorrect: e.target.value,
                                },
                              })}
                              placeholder="Feedback bij onjuiste plaatsing..."
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Feedback tab */}
        <TabsContent value="feedback" className="flex-1 p-4">
          <FeedbackPanel
            feedback={currentQuestion.feedback}
            correctFeedback={currentQuestion.correctFeedback}
            incorrectFeedback={currentQuestion.incorrectFeedback}
            feedbackImageUrl={currentQuestion.feedbackImageUrl}
            correctFeedbackImageUrl={currentQuestion.correctFeedbackImageUrl}
            incorrectFeedbackImageUrl={currentQuestion.incorrectFeedbackImageUrl}
            onFeedbackChange={handleFeedbackChange}
            onCorrectFeedbackChange={handleCorrectFeedbackChange}
            onIncorrectFeedbackChange={handleIncorrectFeedbackChange}
            onFeedbackImageChange={handleFeedbackImageChange}
            onCorrectFeedbackImageChange={handleCorrectFeedbackImageChange}
            onIncorrectFeedbackImageChange={handleIncorrectFeedbackImageChange}
          />
        </TabsContent>
        
        {/* Instellingen tab */}
        <TabsContent value="settings" className="flex-1 p-4">
          <div className="space-y-6">
            <div className="border-b pb-4 mb-6">
              <h3 className="text-lg font-medium mb-4">Algemene Instellingen</h3>
              
              <div className="space-y-2">
                <Label htmlFor="min-correct-hotspots">Minimum aantal correcte hotspots</Label>
                <Input
                  id="min-correct-hotspots"
                  type="number"
                  min={1}
                  value={currentQuestion.hotspotSettings?.minimumCorrectHotspots || 1}
                  onChange={(e) => onQuestionChange({
                    ...currentQuestion,
                    hotspotSettings: {
                      ...currentQuestion.hotspotSettings,
                      minimumCorrectHotspots: parseInt(e.target.value) || 1,
                    },
                  })}
                />
                <p className="text-sm text-gray-500">
                  Aantal correcte hotspots dat een student moet aanklikken om de vraag goed te rekenen.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Voorvertoning tab */}
        <TabsContent value="preview" className="flex-1 p-4">
          {!currentQuestion.mediaUrl ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <p className="mb-4">Upload eerst een afbeelding in het 'Basisgegevens' tabblad.</p>
                <Button onClick={() => setActiveTab("basic")}>Ga naar Basisgegevens</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <h3 className="text-lg font-medium mb-4">Voorvertoning</h3>
              <div className="rounded-lg">
                <HotspotPreview
                  text={currentQuestion.text}
                  mediaUrl={currentQuestion.mediaUrl}
                  imageSize={currentQuestion.imageSize}
                  hotspots={currentQuestion.hotspots || []}
                  definitions={currentQuestion.definitions || []}
                  settings={currentQuestion.hotspotSettings}
                  feedback={currentQuestion.feedback}
                  feedbackImageUrl={currentQuestion.feedbackImageUrl}
                  correctFeedback={currentQuestion.correctFeedback}
                  incorrectFeedback={currentQuestion.incorrectFeedback}
                  correctFeedbackImageUrl={currentQuestion.correctFeedbackImageUrl}
                  incorrectFeedbackImageUrl={currentQuestion.incorrectFeedbackImageUrl}
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const HotspotQuestionEditor = withBaseQuestionEditor(HotspotQuestionEditorBase);