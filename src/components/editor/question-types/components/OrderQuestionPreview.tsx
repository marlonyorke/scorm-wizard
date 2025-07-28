
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import React from "react";

import { PreviewSortableItem } from "./PreviewSortableItem";

import type { OrderItem } from "@/types/questions/order";

interface OrderQuestionPreviewProps {
  text: string;
  items: OrderItem[];
  mediaUrl?: string;
  imageSize?: {
    width: number;
    height: number;
  };
  onDragEnd: (event: DragEndEvent) => void;
  sensors: any;
}

export const OrderQuestionPreview = ({
  text,
  items,
  mediaUrl,
  imageSize,
  onDragEnd,
  sensors,
}: OrderQuestionPreviewProps) => {
  return (
    <div className="border-t pt-6 mt-6">
      <h3 className="text-lg font-medium mb-4">Voorvertoning</h3>
      <div className="bg-card text-card-foreground rounded-lg border p-4">
        <div className="space-y-4">
          <p className="font-medium">{text}</p>
          
          {mediaUrl && (
            <img 
              src={mediaUrl} 
              alt="Vraag afbeelding"
              className="rounded-lg max-w-full h-auto"
              style={{
                width: imageSize?.width || 300,
                height: imageSize?.height || 200,
                objectFit: "contain",
              }}
            />
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((item) => (
                  <PreviewSortableItem
                    key={item.id}
                    id={item.id}
                    text={item.text}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};
