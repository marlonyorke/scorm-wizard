import { useState, useRef } from "react";

interface ResizableImageProps {
  src: string;
  alt?: string;
  className?: string;
  initialSize?: { width: number; height: number };
  onSizeChange?: (size: { width: number; height: number }) => void;
  style?: React.CSSProperties;
}

export function ResizableImage({ 
  src, 
  alt = "Vraag afbeelding",
  className = "rounded-lg",
  initialSize,
  onSizeChange,
  style, 
}: ResizableImageProps) {
  const [size] = useState<{ width: number; height: number }>(
    initialSize || { width: 300, height: 200 },
  );
  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <div className="relative inline-block">
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        style={{
          width: size.width,
          height: size.height,
          objectFit: "contain",
          ...style,
        }}
        className={className}
      />
    </div>
  );
}
