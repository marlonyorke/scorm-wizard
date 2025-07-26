import { Upload } from "lucide-react";
import { useState, useEffect } from "react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Question } from "@/types/editor";

// Voorgedefinieerde groottes
const IMAGE_SIZES = {
  small: { width: 200, height: 133 },
  medium: { width: 300, height: 200 },
  large: { width: 450, height: 300 },
};

interface MediaUploadProps {
  media?: string;
  imageSize?: {
    width: number;
    height: number;
  };
  onMediaChange: (mediaUrl: string | undefined, imageSize?: { width: number; height: number }) => void;
}

export function MediaUpload({ media, imageSize, onMediaChange }: MediaUploadProps) {
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("medium");

  // Bepaal de initiële grootte op basis van de props
  useEffect(() => {
    if (imageSize) {
      // Vind de dichtstbijzijnde voorgedefinieerde grootte
      const sizes = Object.entries(IMAGE_SIZES);
      let closestSize = sizes[0];
      let minDiff = Math.abs(imageSize.width - sizes[0][1].width);
      
      for (let i = 1; i < sizes.length; i++) {
        const diff = Math.abs(imageSize.width - sizes[i][1].width);
        if (diff < minDiff) {
          minDiff = diff;
          closestSize = sizes[i];
        }
      }
      
      setSelectedSize(closestSize[0]);
    }
  }, [imageSize]);

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

      // Gebruik de geselecteerde grootte
      onMediaChange(base64String, IMAGE_SIZES[selectedSize as keyof typeof IMAGE_SIZES]);

      // Reset the file input after successful upload
      if (event.target) {
        event.target.value = "";
      }

      toast({
        title: "Media geüpload",
        description: "De afbeelding is succesvol toegevoegd.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout bij uploaden",
        description: "Er is een fout opgetreden bij het verwerken van het bestand.",
      });
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    if (media) {
      onMediaChange(media, IMAGE_SIZES[size as keyof typeof IMAGE_SIZES]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {media ? (
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <Label htmlFor="image-size" className="text-sm font-medium">Afbeeldingsgrootte</Label>
            <Select value={selectedSize} onValueChange={handleSizeChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Grootte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Klein</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Groot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <>
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif"
            className="hidden"
            id="media-upload"
            onChange={handleMediaUpload}
          />
          <label htmlFor="media-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Upload className="h-4 w-4 mr-2" />
            <span>Afbeelding toevoegen</span>
          </label>
          <p className="text-xs text-muted-foreground ml-2">
            PNG, JPG of GIF (max. 5MB)
          </p>
        </>
      )}
    </div>
  );
}
