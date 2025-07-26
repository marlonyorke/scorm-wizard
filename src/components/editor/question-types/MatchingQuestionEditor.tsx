import { Trash2 } from "lucide-react";
import React, { useEffect } from "react";

import { MatchingPreview } from "../../questions/preview/MatchingPreview";
import { MediaUpload } from "../form/MediaUpload";
import type { BaseQuestionEditorProps } from "../question-editors/base/BaseQuestionEditor";
import { withBaseQuestionEditor } from "../question-editors/base/BaseQuestionEditor";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/editor";

interface MatchingQuestionEditorProps extends BaseQuestionEditorProps {
  validateQuestion?: (question: Question) => { field: string; message: string; }[];
}

function MatchingQuestionEditorComponent({
  currentQuestion,
  onQuestionChange,
}: MatchingQuestionEditorProps) {
  const { toast } = useToast();
  console.log("MatchingQuestionEditor rendering with question:", currentQuestion);

  if (!currentQuestion) {
    console.error("No current question provided to MatchingQuestionEditor");
    return null;
  }

  if (currentQuestion.type !== "matching") {
    console.error("Invalid question type for MatchingQuestionEditor:", currentQuestion.type);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Er is een probleem met het laden van de matching vraag editor.",
    });
    return null;
  }

  useEffect(() => {
    if (!currentQuestion.pairs) {
      console.log("Initializing empty pairs array");
      onQuestionChange({
        ...currentQuestion,
        pairs: [],
      });
    }
  }, [currentQuestion, onQuestionChange]);

  const handleAddPair = () => {
    console.log("Adding new pair");
    onQuestionChange({
      ...currentQuestion,
      pairs: [
        ...(currentQuestion.pairs || []),
        { id: crypto.randomUUID(), left: "", right: "" },
      ],
    });
  };

  const handlePairChange = (pairId: string, field: "left" | "right", value: string) => {
    console.log("Changing pair:", pairId, field, value);
    onQuestionChange({
      ...currentQuestion,
      pairs: currentQuestion.pairs?.map((pair) =>
        pair.id === pairId ? { ...pair, [field]: value } : pair,
      ),
    });
  };

  const handleRemovePair = (pairId: string) => {
    console.log("Removing pair:", pairId);
    onQuestionChange({
      ...currentQuestion,
      pairs: currentQuestion.pairs?.filter((pair) => pair.id !== pairId),
    });
  };

  const handleMediaChange = (mediaUrl: string | undefined, imageSize?: { width: number; height: number }) => {
    onQuestionChange({
      ...currentQuestion,
      mediaUrl,
      imageSize,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question-text">Vraag</Label>
        <Input
          id="question-text"
          placeholder="Typ hier je vraag..."
          value={currentQuestion.text}
          onChange={(e) => onQuestionChange({ ...currentQuestion, text: e.target.value })}
        />
      </div>

      <MediaUpload 
        media={currentQuestion.mediaUrl}
        imageSize={currentQuestion.imageSize}
        onMediaChange={handleMediaChange}
      />

      <div className="space-y-4">
        <Label>Matching Paren</Label>
        {currentQuestion.pairs?.map((pair) => (
          <div key={pair.id} className="flex gap-4 items-start">
            <div className="flex-1">
              <Input
                placeholder="Linker item..."
                value={pair.left}
                onChange={(e) => handlePairChange(pair.id, "left", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Rechter item..."
                value={pair.right}
                onChange={(e) => handlePairChange(pair.id, "right", e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemovePair(pair.id)}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button onClick={handleAddPair} variant="outline" className="w-full">
          Voeg paar toe
        </Button>
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-medium mb-4">Voorvertoning</h3>
        <div className={cn(
          "rounded-lg border p-4",
          "bg-secondary/20 backdrop-blur-sm",
        )}>
          <MatchingPreview
            text={currentQuestion.text}
            pairs={currentQuestion.pairs || []}
            mediaUrl={currentQuestion.mediaUrl}
            imageSize={currentQuestion.imageSize}
          />
        </div>
      </div>
    </div>
  );
}

export const MatchingQuestionEditor = withBaseQuestionEditor(MatchingQuestionEditorComponent);
