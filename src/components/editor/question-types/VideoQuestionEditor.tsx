
import { Upload, Plus } from "lucide-react";
import React from "react";

import type { BaseQuestionEditorProps } from "../question-editors/base/BaseQuestionEditor";
import { withBaseQuestionEditor } from "../question-editors/base/BaseQuestionEditor";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import type { Question } from "@/types/editor";

interface VideoQuestionEditorProps extends BaseQuestionEditorProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
}

const VideoQuestionEditorComponent: React.FC<VideoQuestionEditorProps> = ({
  currentQuestion,
  onQuestionChange,
}) => {
  const { toast } = useToast();

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Voor nu gebruiken we een placeholder voor video upload
    // In de volgende sprint implementeren we de echte video upload functionaliteit
    const fakeVideoUrl = URL.createObjectURL(file);
    
    onQuestionChange({
      ...currentQuestion,
      videoUrl: fakeVideoUrl,
      markers: currentQuestion.markers || [],
    });

    toast({
      title: "Video geüpload",
      description: "De video is succesvol toegevoegd.",
    });
  };

  const addMarker = () => {
    const newMarker = {
      id: crypto.randomUUID(),
      time: 0,
      question: {
        text: "",
        options: [],
      },
    };

    onQuestionChange({
      ...currentQuestion,
      markers: [...(currentQuestion.markers || []), newMarker],
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed rounded-lg p-6">
        <input
          type="file"
          accept="video/*"
          className="hidden"
          id="video-upload"
          onChange={handleVideoUpload}
        />
        <label htmlFor="video-upload" className="cursor-pointer block">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Sleep video hierheen of klik om te uploaden
          </p>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            MP4, WebM of OGG (max. 100MB)
          </p>
        </label>
      </div>

      {currentQuestion.videoUrl && (
        <div className="space-y-4">
          <video
            src={currentQuestion.videoUrl}
            controls
            className="w-full rounded-lg"
          />
          
          <div className="space-y-2">
            <Label>Tijdsmarkeringen</Label>
            <Button 
              type="button" 
              variant="outline" 
              onClick={addMarker}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Voeg markering toe
            </Button>
          </div>

          {currentQuestion.markers && currentQuestion.markers.length > 0 && (
            <div className="space-y-2">
              {currentQuestion.markers.map((marker) => (
                <div key={marker.id} className="p-4 border rounded-lg">
                  <p>Tijd: {marker.time} seconden</p>
                  <p>Vraag: {marker.question.text || "Geen vraag toegevoegd"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const VideoQuestionEditor = withBaseQuestionEditor(VideoQuestionEditorComponent);
