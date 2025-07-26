import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useState } from 'react';
import { MediaUpload } from '../form/MediaUpload';
import { withBaseQuestionEditor } from '../question-editors/base/BaseQuestionEditor';
import type { ValidationError } from '../question-editors/base/BaseQuestionEditor';

import { OrderQuestionHelp } from "./components/OrderQuestionHelp";
import { OrderQuestionPreview } from "./components/OrderQuestionPreview";
import { SortableItem } from "./components/SortableItem";

import { QuestionImage } from "@/components/questions/preview/QuestionImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Question } from "@/types/editor";
import { OrderQuestionData } from "@/types/questions/order";
import type { OrderItem } from "@/types/questions/order";

interface OrderQuestionEditorProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
  showNameField?: boolean;
}

const OrderQuestionEditorComponent: React.FC<OrderQuestionEditorProps> = ({
  currentQuestion,
  onQuestionChange,
}) => {
  const [previewItems, setPreviewItems] = useState<OrderItem[]>(currentQuestion.items as OrderItem[] || []);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = currentQuestion.items?.findIndex((item) => item.id === active.id);
      const newIndex = currentQuestion.items?.findIndex((item) => item.id === over?.id);

      if (oldIndex !== undefined && newIndex !== undefined && currentQuestion.items) {
        const newItems = arrayMove(currentQuestion.items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          correctPosition: index + 1,
        }));

        onQuestionChange({
          ...currentQuestion,
          items: newItems,
        });
      }
    }
  };

  const handlePreviewDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = previewItems.findIndex((item) => item.id === active.id);
      const newIndex = previewItems.findIndex((item) => item.id === over?.id);

      setPreviewItems((prevItems) => {
        const newItems = arrayMove(prevItems, oldIndex, newIndex).map((item, index) => ({
          ...item,
          correctPosition: index + 1,
        }));
        return newItems;
      });
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      text: "",
      correctPosition: (currentQuestion.items?.length || 0) + 1,
    };

    onQuestionChange({
      ...currentQuestion,
      items: [...(currentQuestion.items || []), newItem],
    });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!currentQuestion.items) {
      return;
    }

    const updatedItems = currentQuestion.items
      .filter((item) => item.id !== itemId)
      .map((item, index) => ({
        ...item,
        correctPosition: index + 1,
      }));

    onQuestionChange({
      ...currentQuestion,
      items: updatedItems,
    });
  };

  const handleItemTextChange = (itemId: string, newText: string) => {
    if (!currentQuestion.items) {
      return;
    }

    const updatedItems = currentQuestion.items.map((item) =>
      item.id === itemId ? { ...item, text: newText } : item,
    );

    onQuestionChange({
      ...currentQuestion,
      items: updatedItems,
    });
  };

  const handleMediaChange = (mediaUrl: string | undefined, imageSize?: { width: number; height: number }) => {
    onQuestionChange({
      ...currentQuestion,
      mediaUrl,
      imageSize: imageSize || { width: 300, height: 200 },
    });
  };

  const handleImageSizeChange = (size: string) => {
    const sizes = {
      small: { width: 200, height: 133 },
      medium: { width: 300, height: 200 },
      large: { width: 400, height: 267 },
    };
    
    onQuestionChange({
      ...currentQuestion,
      imageSize: sizes[size as keyof typeof sizes],
    });
  };

  React.useEffect(() => {
    setPreviewItems(currentQuestion.items as OrderItem[] || []);
  }, [currentQuestion.items]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label>Vraag</Label>
        <OrderQuestionHelp />
      </div>

      <Input
        value={currentQuestion.text}
        onChange={(e) => onQuestionChange({
          ...currentQuestion,
          text: e.target.value,
        })}
        placeholder="Typ hier je vraag..."
      />

      <div className="space-y-4">
        <Label>Feedback bij correct antwoord</Label>
        <Input
          value={currentQuestion.feedback}
          onChange={(e) => onQuestionChange({
            ...currentQuestion,
            feedback: e.target.value,
          })}
          placeholder="Bijvoorbeeld: Goed gedaan! Je hebt de planeten in de juiste volgorde gezet."
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Afbeelding</Label>
          {currentQuestion.mediaUrl && (
            <Select
              value={
                currentQuestion.imageSize?.width === 200 ? "small" :
                  currentQuestion.imageSize?.width === 400 ? "large" : "medium"
              }
              onValueChange={handleImageSizeChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Kies grootte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Klein</SelectItem>
                <SelectItem value="medium">Normaal</SelectItem>
                <SelectItem value="large">Groot</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        {currentQuestion.mediaUrl ? (
          <div className="relative">
            <QuestionImage
              src={currentQuestion.mediaUrl}
              imageSize={currentQuestion.imageSize}
              isEnlarged={isImageEnlarged}
              onToggleEnlarge={() => setIsImageEnlarged(!isImageEnlarged)}
            />
            <Button
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => onQuestionChange({ ...currentQuestion, mediaUrl: undefined })}
            >
              Verwijderen
            </Button>
          </div>
        ) : (
          <MediaUpload
            media={currentQuestion.mediaUrl}
            imageSize={currentQuestion.imageSize}
            onMediaChange={handleMediaChange}
          />
        )}
      </div>

      <div className="space-y-4">
        <Label>Items</Label>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentQuestion.items?.map((item) => item.id) || []}
            strategy={verticalListSortingStrategy}
          >
            {currentQuestion.items?.map((item, index) => (
              <SortableItem
                key={item.id}
                id={item.id}
                index={index}
                text={item.text}
                onTextChange={(text) => handleItemTextChange(item.id, text)}
                onRemove={() => handleRemoveItem(item.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          className="w-full"
        >
          Item toevoegen
        </Button>
      </div>

      <OrderQuestionPreview
        text={currentQuestion.text}
        items={previewItems}
        mediaUrl={currentQuestion.mediaUrl}
        imageSize={currentQuestion.imageSize}
        onDragEnd={handlePreviewDragEnd}
        sensors={sensors}
      />
    </div>
  );
};

const validateOrderQuestion = (question: Question): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!question.text?.trim()) {
    errors.push({
      field: "text",
      message: "Voer een vraag in",
    });
  }

  if (!question.items || question.items.length < 2) {
    errors.push({
      field: "items",
      message: "Voeg minimaal twee items toe",
    });
  }

  return errors;
};

export const OrderQuestionEditor = withBaseQuestionEditor<OrderQuestionEditorProps>(
  OrderQuestionEditorComponent,
  validateOrderQuestion,
);
