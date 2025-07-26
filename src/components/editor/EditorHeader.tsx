
import { Save, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ScormExportDialog } from "@/components/scorm/ScormExportDialog";
import { Button } from "@/components/ui/button";
import { useQuestions } from "@/contexts/QuestionsContext";
import { useToast } from "@/hooks/use-toast";

export function EditorHeader({ onSave }: { onSave: () => void }) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/question-types");
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar vraagtypes
        </Button>
        <h1 className="text-2xl font-bold">Quiz Editor</h1>
      </div>
      <div className="space-x-2">
        <ScormExportDialog />
        <Button onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Opslaan
        </Button>
      </div>
    </div>
  );
}
