import { Image as ImageIcon, X, Upload, Trash } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface FeedbackImageUploadProps {
  feedbackImageUrl?: string;
  onFeedbackImageChange: (url: string | undefined) => void;
}

export function FeedbackImageUpload({ 
  feedbackImageUrl, 
  onFeedbackImageChange, 
}: FeedbackImageUploadProps) {
  const { toast } = useToast();

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Fout bij uploaden",
        description: "Het bestand is te groot. Maximum grootte is 5MB.",
      });
      return;
    }

    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      onFeedbackImageChange(base64String);

      // Reset the file input after successful upload
      if (event.target) {
        event.target.value = "";
      }

      toast({
        title: "Afbeelding geüpload",
        description: "De feedback afbeelding is succesvol toegevoegd.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout bij uploaden",
        description: "Er is een fout opgetreden bij het verwerken van het bestand.",
      });
    }
  };

  const handleRemoveImage = () => {
    onFeedbackImageChange(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Feedback afbeelding/GIF</Label>
      </div>

      {!feedbackImageUrl ? (
        <div className="border-2 border-dashed rounded-lg p-6">
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif"
            className="hidden"
            id="feedback-image-upload"
            onChange={handleMediaUpload}
          />
          <label htmlFor="feedback-image-upload" className="cursor-pointer block">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Sleep bestanden hierheen of klik om te uploaden
            </p>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              PNG, JPG of GIF (max. 5MB)
            </p>
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative border rounded-md overflow-hidden">
            <img 
              src={feedbackImageUrl} 
              alt="Feedback afbeelding" 
              className="w-full h-auto max-h-48 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/400x300?text=Afbeelding+niet+gevonden";
              }}
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-8 w-8 bg-white/80 hover:bg-red-100"
                onClick={handleRemoveImage}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif"
              className="hidden"
              id="feedback-image-replace"
              onChange={handleMediaUpload}
            />
            <label htmlFor="feedback-image-replace" className="cursor-pointer">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>Vervangen</span>
              </Button>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
