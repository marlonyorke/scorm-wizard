
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SortableItemProps {
  id: string;
  index: number;
  text: string;
  onTextChange: (text: string) => void;
  onRemove: () => void;
}

export const SortableItem = ({ id, text, onTextChange, onRemove }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 mb-2"
    >
      <div {...attributes} {...listeners} className="cursor-move">
        <GripVertical className="text-gray-400" />
      </div>
      <Input
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Voer item tekst in"
        className="flex-1"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        type="button"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
