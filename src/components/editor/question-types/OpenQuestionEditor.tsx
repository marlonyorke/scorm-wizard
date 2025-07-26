import { PlusCircle, X, Edit, Save } from "lucide-react";
import { useState } from "react";

import { EditableText } from "../form/EditableText";
import { MediaUpload } from "../form/MediaUpload";
import type { ValidationError } from "../question-editors/base/BaseQuestionEditor";
import { withBaseQuestionEditor } from "../question-editors/base/BaseQuestionEditor";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Question, Keyword } from "@/types/editor";


import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";


interface OpenQuestionEditorProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
  validateQuestion?: (question: Question) => ValidationError[];
  showNameField?: boolean;
}

// Helper function to count words in a text
const countWords = (text: string) => {
  if (!text) {
    return 0;
  }
  return text.trim().split(/\s+/).filter(Boolean).length;
};

function OpenQuestionEditorBase({
  currentQuestion,
  onQuestionChange,
  validateQuestion,
}: OpenQuestionEditorProps) {
  const [newKeyword, setNewKeyword] = useState("");
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [editingKeywordText, setEditingKeywordText] = useState("");

  const handleQuestionTextChange = (newText: string) => {
    onQuestionChange({
      ...currentQuestion,
      text: newText,
    });
  };

  const handleModelAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onQuestionChange({
      ...currentQuestion,
      modelAnswer: e.target.value,
    });
  };

  const handleMediaChange = (mediaUrl: string | undefined, imageSize?: { width: number; height: number }) => {
    onQuestionChange({
      ...currentQuestion,
      mediaUrl,
      imageSize,
    });
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onQuestionChange({
      ...currentQuestion,
      feedback: e.target.value,
    });
  };

  const handleMinWordsChange = (values: number[]) => {
    onQuestionChange({
      ...currentQuestion,
      minWords: values[0],
    });
  };

  const handleMaxWordsChange = (values: number[]) => {
    onQuestionChange({
      ...currentQuestion,
      maxWords: values[0],
    });
  };

  const handleCaseSensitiveChange = (checked: boolean) => {
    onQuestionChange({
      ...currentQuestion,
      caseSensitive: checked,
    });
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) {
      return;
    }
    
    const keywords = [...(currentQuestion.keywords || [])];
    keywords.push({ id: crypto.randomUUID(), text: newKeyword.trim() });
    
    onQuestionChange({
      ...currentQuestion,
      keywords,
    });
    
    setNewKeyword("");
  };

  const handleRemoveKeyword = (id: string) => {
    const keywords = (currentQuestion.keywords || []).filter((k) => k.id !== id);
    
    onQuestionChange({
      ...currentQuestion,
      keywords,
    });
  };

  const startEditingKeyword = (keyword: Keyword) => {
    setEditingKeywordId(keyword.id);
    setEditingKeywordText(keyword.text);
  };

  const saveEditingKeyword = () => {
    if (!editingKeywordId || !editingKeywordText.trim()) {
      setEditingKeywordId(null);
      return;
    }

    const keywords = (currentQuestion.keywords || []).map((k) => 
      k.id === editingKeywordId ? { ...k, text: editingKeywordText.trim() } : k,
    );
    
    onQuestionChange({
      ...currentQuestion,
      keywords,
    });
    
    setEditingKeywordId(null);
  };

  // Sample student text for highlighting keywords in preview
  const sampleText = currentQuestion.modelAnswer || "Dit is een voorbeeldantwoord. De student zou hier een antwoord kunnen schrijven dat de belangrijke concepten bevat die de docent zoekt.";
  
  // Highlight keywords in the sample text for the preview
  const highlightKeywords = (text: string, keywords: Keyword[] = [], caseSensitive = false) => {
    if (!keywords.length) {
      return text;
    }
    
    let result = text;
    const keywordTexts = keywords.map((k) => k.text);
    
    // Create a regex pattern from all keywords, with word boundaries
    const pattern = keywordTexts
      .map((keyword) => `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`)
      .join("|");
    
    // Apply regex replacement with appropriate case sensitivity
    const regex = new RegExp(pattern, caseSensitive ? "g" : "gi");
    result = result.replace(regex, (match) => `<mark class="bg-yellow-200 px-1 rounded">${match}</mark>`);
    
    return result;
  };

  // Count words in model answer
  const modelAnswerWordCount = countWords(currentQuestion.modelAnswer || "");

  // Default values for min/max words if not set
  const minWords = currentQuestion.minWords || 50;
  const maxWords = currentQuestion.maxWords || 200;

  return (
    <div className="space-y-8">
      {/* Question text */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Vraag</Label>
        <EditableText
          value={currentQuestion.text}
          onSave={handleQuestionTextChange}
          placeholder="Typ hier je vraag..."
        />
      </div>

      {/* Media upload */}
      <MediaUpload 
        media={currentQuestion.mediaUrl}
        imageSize={currentQuestion.imageSize}
        onMediaChange={handleMediaChange}
      />

      {/* Model answer */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Modelantwoord (voor docent)</Label>
        <Textarea 
          value={currentQuestion.modelAnswer || ""}
          onChange={handleModelAnswerChange}
          placeholder="Schrijf hier een voorbeeldantwoord dat docenten kunnen gebruiken bij het nakijken..."
          className="min-h-[120px]"
        />
        <div className="text-xs text-muted-foreground">
          Aantal woorden: {modelAnswerWordCount}
        </div>
      </div>

      {/* Keywords */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Sleutelwoorden</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {(currentQuestion.keywords || []).map((keyword) => (
            editingKeywordId === keyword.id ? (
              <div key={keyword.id} className="flex items-center">
                <Input 
                  value={editingKeywordText}
                  onChange={(e) => setEditingKeywordText(e.target.value)}
                  className="h-8 w-auto"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={saveEditingKeyword}
                  className="h-8 w-8"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Badge key={keyword.id} className="px-3 py-1 flex items-center gap-1">
                {keyword.text}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => startEditingKeyword(keyword)}
                  className="h-5 w-5 ml-1 -mr-1"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveKeyword(keyword.id)}
                  className="h-5 w-5 -mr-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Voeg een nieuw sleutelwoord toe..."
            className="flex-1"
          />
          <Button onClick={handleAddKeyword} className="flex-shrink-0">
            <PlusCircle className="h-4 w-4 mr-2" />
            Toevoegen
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Switch 
            id="case-sensitive"
            checked={currentQuestion.caseSensitive}
            onCheckedChange={handleCaseSensitiveChange}
          />
          <Label htmlFor="case-sensitive">Hoofdlettergevoelig</Label>
        </div>
      </div>

      {/* Min/Max words */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Minimum aantal woorden: {minWords}</Label>
          <Slider
            value={[minWords]}
            min={10}
            max={500}
            step={10}
            onValueChange={handleMinWordsChange}
            className="mt-2"
          />
        </div>
        <div>
          <Label className="text-base font-medium">Maximum aantal woorden: {maxWords}</Label>
          <Slider 
            value={[maxWords]}
            min={50}
            max={1000}
            step={50}
            onValueChange={handleMaxWordsChange}
            className="mt-2"
          />
        </div>
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Feedback</Label>
        <Textarea 
          value={currentQuestion.feedback || ""}
          onChange={handleFeedbackChange}
          placeholder="Algemene feedback voor de student..."
          className="min-h-[100px]"
        />
      </div>

      {/* Preview */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-medium mb-4">Voorvertoning</h3>
        <div className="glass-card rounded-lg p-6">
          <div className="space-y-6">
            <h2 className="text-lg font-medium">{currentQuestion.text || "Voorbeeld vraag"}</h2>
            
            {currentQuestion.mediaUrl && (
              <div className="mb-4">
                <img 
                  src={currentQuestion.mediaUrl} 
                  alt="Vraag afbeelding" 
                  className="max-w-full rounded-lg"
                  style={currentQuestion.imageSize ? {
                    width: currentQuestion.imageSize.width,
                    height: currentQuestion.imageSize.height,
                  } : {}}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Jouw antwoord:</Label>
              <Textarea 
                className="min-h-[150px] bg-background"
                placeholder="Type hier je antwoord..."
                disabled
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{minWords === maxWords ? `Exact ${minWords} woorden vereist` : `${minWords}-${maxWords} woorden vereist`}</span>
                <span>Aantal woorden: 0</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Highlighting van sleutelwoorden in voorbeeldantwoord:</h4>
              <div 
                className="text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: highlightKeywords(
                    sampleText, 
                    currentQuestion.keywords || [], 
                    currentQuestion.caseSensitive,
                  ),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const OpenQuestionEditor = withBaseQuestionEditor(OpenQuestionEditorBase);