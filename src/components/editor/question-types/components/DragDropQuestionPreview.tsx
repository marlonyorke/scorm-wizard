import type { DragEndEvent} from "@dnd-kit/core";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useMemo, useState } from "react";

import { useTheme } from "@/contexts/ThemeContext";
import type { DragDropItem, DragDropZone } from "@/types/editor";

interface DragDropQuestionPreviewProps {
  text: string;
  items: DragDropItem[];
  dropZones: DragDropZone[];
  mediaUrl?: string;
  imageSize?: {
    width: number;
    height: number;
  };
  randomizeItems?: boolean;
}

const DraggableItem = ({ id, text, isNeonTheme, isDarkTheme }: { id: string; text: string; isNeonTheme: boolean; isDarkTheme: boolean }) => {
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
      className={
        isNeonTheme 
          ? "inline-block bg-[#190061] text-[#00f2ff] rounded-md px-4 py-2 m-1 cursor-move hover:bg-[#2a0087] border border-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.4)] hover:shadow-[0_0_12px_rgba(0,242,255,0.7)] transition-all" 
          : isDarkTheme
            ? "inline-block bg-gray-700 text-white rounded-md px-4 py-2 m-1 cursor-move hover:bg-gray-600 border border-gray-600 transition-all"
            : "inline-block bg-white text-gray-800 rounded-md px-4 py-2 m-1 cursor-move hover:bg-gray-100 border border-gray-300 transition-all"
      }
    >
      {text}
    </div>
  );
};

const DropZone = ({ zone, isNeonTheme, isDarkTheme }: { zone: DragDropZone; isNeonTheme: boolean; isDarkTheme: boolean }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: zone.id,
  });

  const dropZoneStyle = {
    width: "200px",
    height: "60px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // Apply appropriate styling based on theme
  const dropZoneClasses = 
    isNeonTheme
      ? `
        border-2 border-dashed rounded-md bg-[rgba(12,0,50,0.3)]
        ${isOver 
    ? "border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.6)]" 
    : "border-[#7b2ff7] shadow-[0_0_8px_rgba(123,47,247,0.3)]"
}
      `
      : isDarkTheme
        ? `
          border-2 border-dashed rounded-md bg-gray-800
          ${isOver 
    ? "border-blue-400" 
    : "border-gray-600"
}
        `
        : `
          border-2 border-dashed rounded-md bg-gray-50
          ${isOver 
    ? "border-blue-400" 
    : "border-gray-300"
}
        `;

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={
        isNeonTheme 
          ? "text-[#00f2ff]" 
          : isDarkTheme
            ? "text-white"
            : "text-gray-800"
      }>{zone.beforeText}</span>
      <div 
        ref={setNodeRef}
        className={dropZoneClasses}
        style={dropZoneStyle}
      >
        <span className={
          isNeonTheme 
            ? `${isOver ? "text-[#00f2ff]" : "text-[#7b2ff7]"} opacity-${isOver ? "80" : "50"}`
            : isDarkTheme
              ? `${isOver ? "text-blue-400" : "text-gray-400"} opacity-${isOver ? "80" : "50"}`
              : `${isOver ? "text-blue-500" : "text-gray-400"} opacity-${isOver ? "80" : "50"}`
        }>
          {isOver ? "Drop hier!" : "Drop hier"}
        </span>
      </div>
      <span className={
        isNeonTheme 
          ? "text-[#00f2ff]" 
          : isDarkTheme
            ? "text-white"
            : "text-gray-800"
      }>{zone.afterText}</span>
    </div>
  );
};

export const DragDropQuestionPreview = ({
  text,
  items,
  dropZones,
  mediaUrl,
  imageSize,
  randomizeItems = false,
}: DragDropQuestionPreviewProps) => {
  const [displayItems, setDisplayItems] = useState<DragDropItem[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const { theme } = useTheme();
  
  // Determine if we should use neon styling
  const isNeonTheme = theme === "neon";
  const isDarkTheme = theme === "dark";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  // Handle drag end event
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      // Update user answers when an item is dropped on a zone
      setUserAnswers((prev) => ({
        ...prev,
        [over.id as string]: active.id as string,
      }));
    }
  };

  // Randomize items if needed
  useMemo(() => {
    if (!randomizeItems) {
      setDisplayItems(items);
    }
    
    // Create a copy of the items array and shuffle it
    else {
      setDisplayItems([...items].sort(() => Math.random() - 0.5));
    }
  }, [items, randomizeItems]);

  // Check answers
  const checkAnswers = () => {
    // Implementation would compare userAnswers with correct answers
    alert("Antwoorden controleren functionaliteit komt binnenkort!");
  };

  // Reset answers
  const resetAnswers = () => {
    setUserAnswers({});
  };

  return (
    <div className={
      isNeonTheme 
        ? "bg-[#0c0032] text-[#00f2ff] p-6 rounded-md border border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.3)]" 
        : isDarkTheme
          ? "bg-gray-900 text-white p-6 rounded-md border border-gray-700 shadow-md"
          : "bg-white text-gray-800 p-6 rounded-md border border-gray-200 shadow-sm"
    }>
      <div className="mb-4">
        <h3 className={
          isNeonTheme 
            ? "text-xl font-bold mb-2 text-[#00f2ff] text-shadow-[0_0_5px_rgba(0,242,255,0.7)]" 
            : isDarkTheme
              ? "text-xl font-bold mb-2 text-white"
              : "text-xl font-bold mb-2 text-gray-800"
        }>{text}</h3>
        <p className={
          isNeonTheme 
            ? "text-[#00f2ff] mb-4" 
            : isDarkTheme
              ? "text-gray-300 mb-4"
              : "text-gray-600 mb-4"
        }>Sleep de items naar de juiste dropzones.</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div className={
          isNeonTheme 
            ? "flex flex-wrap gap-4 mb-6 p-3 bg-[rgba(25,0,97,0.5)] rounded-md border border-[#7b2ff7] shadow-[0_0_10px_rgba(123,47,247,0.3)]" 
            : isDarkTheme
              ? "flex flex-wrap gap-4 mb-6 p-3 bg-gray-800 rounded-md border border-gray-700"
              : "flex flex-wrap gap-4 mb-6 p-3 bg-gray-100 rounded-md border border-gray-300"
        }>
          <SortableContext items={displayItems.map((item) => item.id)}>
            {displayItems.map((item) => (
              <DraggableItem key={item.id} id={item.id} text={item.text} isNeonTheme={isNeonTheme} isDarkTheme={isDarkTheme} />
            ))}
          </SortableContext>
        </div>

        <div className={
          isNeonTheme 
            ? "space-y-4 p-3 bg-[rgba(25,0,97,0.3)] rounded-md" 
            : isDarkTheme
              ? "space-y-4 p-3 bg-gray-800 rounded-md"
              : "space-y-4 p-3 bg-gray-50 rounded-md"
        }>
          {dropZones.map((zone) => (
            <DropZone
              key={zone.id}
              zone={zone}
              isNeonTheme={isNeonTheme}
              isDarkTheme={isDarkTheme}
            />
          ))}
        </div>
      </DndContext>

      <div className="mt-6 flex justify-end space-x-4">
        <button 
          className={
            isNeonTheme 
              ? "bg-[#190061] text-[#00f2ff] px-4 py-2 rounded-md border border-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.5)] hover:shadow-[0_0_12px_rgba(0,242,255,0.7)] transition-all" 
              : isDarkTheme
                ? "bg-blue-600 text-white px-4 py-2 rounded-md border border-blue-700 hover:bg-blue-700 transition-all"
                : "bg-blue-500 text-gray-800 px-4 py-2 rounded-md border border-gray-300 hover:bg-blue-600 transition-all"
          }
          onClick={checkAnswers}
        >
          Controleer
        </button>
        <button 
          className={
            isNeonTheme 
              ? "bg-[#190061] text-[#00f2ff] px-4 py-2 rounded-md border border-[#7b2ff7] shadow-[0_0_8px_rgba(123,47,247,0.5)] hover:shadow-[0_0_12px_rgba(123,47,247,0.7)] transition-all" 
              : isDarkTheme
                ? "bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-600 transition-all"
                : "bg-gray-200 text-gray-800 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-300 transition-all"
          }
          onClick={resetAnswers}
        >
          Opnieuw
        </button>
      </div>
    </div>
  );
};
