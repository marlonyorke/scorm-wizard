import { Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuestions } from "@/contexts/QuestionsContext";
import { useToast } from "@/hooks/use-toast";
import { generateScormPackage } from "@/utils/scormExport";

export type QuestionDisplayMode = "single-page" | "multi-page" | "grouped";

interface ScormExportDialogProps {
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

export function ScormExportDialog({ onExportStart, onExportComplete }: ScormExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [displayMode, setDisplayMode] = useState<QuestionDisplayMode>("single-page");
  const [questionsPerGroup, setQuestionsPerGroup] = useState("3");
  const [currentTheme, setCurrentTheme] = useState("light");
  const { questions } = useQuestions();
  const { toast } = useToast();

  // Detecteer het huidige thema bij het openen van de dialog
  useEffect(() => {
    if (isOpen) {
      // Haal de huidige mode op uit localStorage
      const isDarkMode = localStorage.getItem("darkMode") === "true";
      
      // Gebruik de gedetecteerde mode
      setCurrentTheme(isDarkMode ? "dark" : "light");
    }
  }, [isOpen]);

  const handleExport = async () => {
    setIsExporting(true);
    onExportStart?.();

    try {
      await generateScormPackage(questions, {
        displayMode,
        questionsPerGroup: displayMode === "grouped" ? parseInt(questionsPerGroup) : undefined,
        theme: currentTheme, // Geef het huidige thema mee aan de export
      });
      
      toast({
        title: "SCORM Export Succesvol",
        description: "Je quiz is geëxporteerd als SCORM pakket.",
      });
      setIsOpen(false);
      onExportComplete?.();
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export mislukt",
        description: error instanceof Error 
          ? error.message 
          : "Er is iets misgegaan tijdens het exporteren. Probeer het opnieuw.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-auto">
          <Download className="mr-2 h-4 w-4" />
          Exporteer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exporteer als SCORM Pakket</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Weergavemodus</Label>
            <RadioGroup 
              value={displayMode} 
              onValueChange={(value) => setDisplayMode(value as QuestionDisplayMode)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single-page" id="single-page" />
                <Label htmlFor="single-page">Enkele pagina (alle vragen op één pagina)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multi-page" id="multi-page" />
                <Label htmlFor="multi-page">Meerdere pagina's (één vraag per pagina)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="grouped" id="grouped" />
                <Label htmlFor="grouped">Gegroepeerd (meerdere vragen per pagina)</Label>
              </div>
            </RadioGroup>
          </div>
          
          {displayMode === "grouped" && (
            <div className="space-y-2">
              <Label htmlFor="questions-per-group">Vragen per groep</Label>
              <Input
                id="questions-per-group"
                type="number"
                min="1"
                max="10"
                value={questionsPerGroup}
                onChange={(e) => setQuestionsPerGroup(e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Thema</Label>
            <div className="text-sm text-muted-foreground">
              Het huidige thema ({currentTheme}) wordt gebruikt in de SCORM-export.
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporteren...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exporteren
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
