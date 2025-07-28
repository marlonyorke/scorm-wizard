import { Eye, Save, Wand2, Loader2, Image, Edit } from "lucide-react";
import React, { useState, useEffect } from "react";

import { EditableText } from "../form/EditableText";
import { MediaUpload } from "../form/MediaUpload";
import type { ValidationError } from "../question-editors/base/BaseQuestionEditor";
import { withBaseQuestionEditor } from "../question-editors/base/BaseQuestionEditor";


import { MarkWordsPreview } from "@/components/questions/preview/MarkWordsPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { aiService } from "@/services/aiService";
import type { Question } from "@/types/editor";

interface MarkWordsQuestionEditorProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
  validateQuestion?: (question: Question) => ValidationError[];
  showNameField?: boolean;
}

function MarkWordsQuestionEditorBase({
  currentQuestion,
  onQuestionChange,
}: MarkWordsQuestionEditorProps) {
  const [activeTab, setActiveTab] = useState("bewerking");
  const [showPreview, setShowPreview] = useState(false);
  const [wordsInput, setWordsInput] = useState("");
  const [contextDescription, setContextDescription] = useState("");
  const [instruction, setInstruction] = useState("");
  const [markedText, setMarkedText] = useState("");
  const [niveau, setNiveau] = useState<"mavo" | "havo" | "vwo">("havo");
  const [leerjaar, setLeerjaar] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [vak, setVak] = useState<string>("Biologie");
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState<number>(250);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | undefined>(undefined);
  const { toast } = useToast();

  // Initialize state from currentQuestion
  useEffect(() => {
    if (currentQuestion) {
      setInstruction(currentQuestion.instruction || "");
      setMarkedText(currentQuestion.markedText || "");
      setNiveau(currentQuestion.niveau || "havo");
      setLeerjaar((currentQuestion.leerjaar as 1 | 2 | 3 | 4 | 5 | 6) || 1);
      setVak(currentQuestion.vak || "Biologie");
      setContextDescription(currentQuestion.contextDescription || "");
      setImageUrl(currentQuestion.imageUrl);
      setImageSize(currentQuestion.imageSize);
      
      // Convert wordsToMark array to comma-separated string for the input field
      if (currentQuestion.wordsToMark && Array.isArray(currentQuestion.wordsToMark) && currentQuestion.wordsToMark.length > 0) {
        setWordsInput(currentQuestion.wordsToMark.join(", "));
      } else {
        setWordsInput("");
      }
    }
  }, [currentQuestion]);

  // Extract words/phrases from the markedText that are marked with ^word^ or ^phrase with spaces^
  const extractMarkedWords = () => {
    if (!markedText) {
      return [];
    }
    
    const matches = markedText.match(/\^([^^]+)\^/g) || [];
    return matches.map((match) => match.replace(/^\^|\^$/g, ""));
  };

  // Update the question when form fields change
  const updateQuestion = () => {
    // Extract words to mark directly from the marked text
    const wordsToMark = extractMarkedWords();
    
    // If no words are marked in the text but we have words/phrases in the input field,
    // use those for AI generation purposes - treat comma-separated items as single units
    const wordsForAI = wordsInput
      .split(",")
      .map((phrase) => phrase.trim())
      .filter((phrase) => phrase.length > 0);

    onQuestionChange({
      ...currentQuestion,
      instruction,
      markedText,
      wordsToMark: wordsToMark.length > 0 ? wordsToMark : wordsForAI,
      niveau,
      leerjaar,
      vak,
      contextDescription,
      imageUrl,
      imageSize,
    });
  };

  // Handle AI generation button click
  const handleGenerateAI = async () => {
    // Valideer of er woorden zijn ingevoerd
    const words = wordsInput
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word.length > 0);
    
    if (words.length === 0) {
      toast({
        title: "Geen woorden ingevoerd",
        description: "Voer minimaal één woord in om een verhaal te genereren.",
        variant: "destructive",
      });
      return;
    }
    
    // Valideer of er een context is ingevoerd
    if (!contextDescription.trim()) {
      toast({
        title: "Geen context ingevoerd",
        description: "Beschrijf de context waarin de woorden moeten voorkomen.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Roep de AI service aan om een verhaal te genereren
      const result = await aiService.generateMarkWordsStory({
        words,
        context: contextDescription,
        niveau,
        leerjaar: leerjaar as number,
        vak,
        wordCount,
      });
      
      // Update de markedText met het gegenereerde verhaal
      setMarkedText(result.story);
      
      // Wacht even tot de state is bijgewerkt voordat we de vraag updaten
      setTimeout(() => {
        // Update de vraag
        onQuestionChange({
          ...currentQuestion,
          instruction,
          markedText: result.story,
          wordsToMark: words,
          niveau,
          leerjaar,
          vak,
          contextDescription,
        });
        
        // Schakel over naar het tabblad met de voorvertoning
        setActiveTab("preview");
        setShowPreview(true);
      }, 100);
      
      toast({
        title: "Verhaal gegenereerd",
        description: "Het AI-gegenereerde verhaal is toegevoegd aan de vraag.",
      });
    } catch (error) {
      console.error("Error generating story:", error);
      toast({
        title: "Fout bij genereren",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden bij het genereren van het verhaal.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse the marked text to display in the preview
  const parseMarkedText = () => {
    if (!markedText) {
      return "";
    }
    
    // Replace ^word^ with <span class="highlighted-word">word</span>
    return markedText.replace(/\^([^^]+)\^/g, '<span class="highlighted-word">$1</span>');
  };

  // Generate word tags from the wordsInput
  const renderWordTags = () => {
    // Verwijderd omdat dit geen meerwaarde heeft
    return null;
  };

  // Bepaal beschikbare leerjaren op basis van niveau
  const getAvailableYears = () => {
    switch (niveau) {
      case "mavo":
        return [1, 2, 3, 4];
      case "havo":
        return [1, 2, 3, 4, 5];
      case "vwo":
        return [1, 2, 3, 4, 5, 6];
      default:
        return [1, 2, 3, 4, 5, 6];
    }
  };

  // Zorg ervoor dat het leerjaar geldig is voor het geselecteerde niveau
  useEffect(() => {
    const availableYears = getAvailableYears();
    if (!availableYears.includes(leerjaar)) {
      setLeerjaar(availableYears[0] as 1 | 2 | 3 | 4 | 5 | 6);
    }
  }, [niveau, leerjaar]);

  // Handle media upload
  const handleMediaChange = (mediaUrl: string | undefined, size?: { width: number; height: number }) => {
    setImageUrl(mediaUrl);
    setImageSize(size);
    updateQuestion();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Mark the Words vraagtype</h2>
        
        {/* Content zonder tabs */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Niveau:</label>
              <Select value={niveau} onValueChange={(value: "mavo" | "havo" | "vwo") => setNiveau(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Kies niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mavo">MAVO</SelectItem>
                  <SelectItem value="havo">HAVO</SelectItem>
                  <SelectItem value="vwo">VWO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Leerjaar:</label>
              <Select 
                value={leerjaar.toString()} 
                onValueChange={(value) => setLeerjaar(parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kies leerjaar" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableYears().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      Leerjaar {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Vak:</label>
              <Select value={vak} onValueChange={setVak}>
                <SelectTrigger>
                  <SelectValue placeholder="Kies vak" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Biologie">Biologie</SelectItem>
                  <SelectItem value="Nederlands">Nederlands</SelectItem>
                  <SelectItem value="Engels">Engels</SelectItem>
                  <SelectItem value="Wiskunde">Wiskunde</SelectItem>
                  <SelectItem value="Natuurkunde">Natuurkunde</SelectItem>
                  <SelectItem value="Scheikunde">Scheikunde</SelectItem>
                  <SelectItem value="Geschiedenis">Geschiedenis</SelectItem>
                  <SelectItem value="Aardrijkskunde">Aardrijkskunde</SelectItem>
                  <SelectItem value="Economie">Economie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-1">Te markeren woorden (komma-gescheiden):</label>
            <Input 
              value={wordsInput}
              onChange={(e) => setWordsInput(e.target.value)}
              placeholder="Voer woorden in gescheiden door komma's, bijv. hart, longen, lever"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-1">Context beschrijving:</label>
            <Textarea 
              value={contextDescription}
              onChange={(e) => setContextDescription(e.target.value)}
              placeholder="Beschrijf de context waarin de woorden moeten voorkomen"
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-1">Instructie voor leerlingen:</label>
            <Input 
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Klik op alle woorden die betrekking hebben op het onderwerp"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-1">
              Aantal woorden in het verhaal: {wordCount}
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">100</span>
              <Slider
                value={[wordCount]}
                min={100}
                max={500}
                step={25}
                onValueChange={(value) => setWordCount(value[0])}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">500</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleGenerateAI}
              className="flex items-center gap-2 bg-primary-accent hover:bg-primary-accent/90 text-white"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Genereren...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Genereer met AI</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium block mb-1">Afbeelding toevoegen:</label>
            <div>
              {imageUrl ? (
                <div className="space-y-4 border rounded-md p-4">
                  <div className="flex justify-center">
                    <img 
                      src={imageUrl} 
                      alt="Vraag afbeelding" 
                      className="max-w-full max-h-[300px] object-contain"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMediaChange(undefined)}
                    >
                      Verwijderen
                    </Button>
                  </div>
                </div>
              ) : (
                <MediaUpload 
                  media={imageUrl}
                  imageSize={imageSize}
                  onMediaChange={handleMediaChange}
                />
              )}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-1">Tekst met te markeren woorden:</label>
            <Textarea
              value={markedText}
              onChange={(e) => setMarkedText(e.target.value)}
              placeholder="Dit is een voorbeeldtekst met ^woord1^ en ^woord2^ en ook ^woord3^ om te markeren."
              rows={8}
              className="font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Markeer woorden met dakjes: ^woord^
            </p>
          </div>
        </div>
        
        {/* Tabs voor bewerking en preview onderaan */}
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="bewerking">Bewerking</TabsTrigger>
              <TabsTrigger value="preview" onClick={() => setShowPreview(true)}>Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bewerking" className="space-y-4">
              {/* Bewerking content is al hierboven weergegeven */}
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              {showPreview ? (
                <>
                  <div className="border p-4 rounded-md min-h-[200px]">
                    <MarkWordsPreview 
                      question={{
                        ...currentQuestion,
                        instruction,
                        markedText,
                        wordsToMark: extractMarkedWords(),
                      }} 
                    />
                  </div>
                  
                  <div className="text-center text-sm text-gray-500 mt-2">
                    * Dit is een voorbeeld van hoe de vraag eruit zal zien voor leerlingen.
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                  <Eye className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">Klik op 'Preview' om de voorvertoning te zien</p>
                  <Button 
                    onClick={() => setShowPreview(true)}
                    variant="outline"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview tonen
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button 
            onClick={updateQuestion}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" />
            Opslaan
          </Button>
        </div>
      </div>
    </div>
  );
}

export const MarkWordsQuestionEditor = withBaseQuestionEditor(MarkWordsQuestionEditorBase);
