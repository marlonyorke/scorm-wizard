
import { Plus, Minus } from "lucide-react";

import { ResizableImage } from "./ResizableImage";

import { cn } from "@/lib/utils";

interface QuestionImageProps {
  src: string;
  imageSize?: {
    width: number;
    height: number;
  };
  isEnlarged: boolean;
  onToggleEnlarge: () => void;
}

export function QuestionImage({ src, imageSize, isEnlarged, onToggleEnlarge }: QuestionImageProps) {
  const defaultSize = { width: 300, height: 200 };
  const size = imageSize || defaultSize;

  return (
    <div className="relative">
      <div className={cn(
        "flex justify-center mb-6 relative group transition-all duration-300",
        isEnlarged ? "fixed inset-0 z-50 bg-black/50 items-center" : "",
      )}>
        <div className={cn(
          "relative",
          isEnlarged ? "max-w-[90vw] max-h-[90vh]" : "",
        )}>
          <ResizableImage 
            src={src}
            initialSize={size}
            className={cn(
              "rounded-lg max-w-full transition-all duration-300",
              isEnlarged ? "max-h-[90vh] w-auto" : "",
            )}
            style={{
              width: isEnlarged ? "auto" : size.width,
              height: isEnlarged ? "auto" : size.height,
              objectFit: "contain",
            }}
          />
          <button
            onClick={onToggleEnlarge}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full",
              "bg-white/90 hover:bg-white shadow-md",
              "text-gray-700 hover:text-gray-900",
              "transition-all duration-200",
              "flex items-center justify-center",
            )}
          >
            {isEnlarged ? (
              <Minus className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
