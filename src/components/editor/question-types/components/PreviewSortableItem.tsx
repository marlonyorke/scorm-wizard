
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import React from "react";

interface PreviewSortableItemProps {
  id: string;
  text: string;
}

export const PreviewSortableItem = ({ id, text }: PreviewSortableItemProps) => {
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
      {...attributes}
      {...listeners}
      className="p-3 bg-card text-card-foreground border rounded-lg shadow-sm cursor-move hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <span>{text || "Leeg item"}</span>
      </div>
    </div>
  );
};
