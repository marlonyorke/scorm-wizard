import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import type { Question } from "@/types/editor";

interface MarkWordsPreviewProps {
  question: Question;
  showFeedback?: boolean;
  onSubmit?: (selectedWords: string[], isCorrect: boolean, score: number) => void;
}

// Interface voor een woord of frase
interface TextItem {
  content: string;
  type: "phrase" | "word";
  index: number;
  isCorrect: boolean;
}

export const MarkWordsPreview: React.FC<MarkWordsPreviewProps> = ({
  question,
  showFeedback = true,
  onSubmit,
}) => {
  // State voor geselecteerde items
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Reset state when question changes
  useEffect(() => {
    setSelectedItems([]);
    setScore(0);
    setError(null);
  }, [question]);

  // Extraheer de correcte frases (tekst tussen dakjes)
  const extractPhrases = () => {
    if (!question.markedText) {
      return [];
    }
    
    const regex = /\^([^^]+)\^/g;
    const matches = [];
    let match;
    
    while ((match = regex.exec(question.markedText)) !== null) {
      matches.push({
        content: match[1],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    
    return matches;
  };

  // Verwijder de dakjes voor weergave
  const getDisplayText = () => {
    return question.markedText ? question.markedText.replace(/\^([^^]+)\^/g, "$1") : "";
  };

  // Bereid alle tekstonderdelen voor (frases en individuele woorden)
  const prepareTextItems = () => {
    if (!question.markedText) {
      return [];
    }
    
    const phrases = extractPhrases();
    const textItems: TextItem[] = [];
    let itemIndex = 0;
    
    // Maak een array van alle tekstdelen
    let lastEnd = 0;
    
    // Verwerk alle frases en tekst ertussen
    phrases.forEach((phrase) => {
      // Verwerk tekst voor deze frase
      if (phrase.start > lastEnd) {
        const textBefore = question.markedText!.substring(lastEnd, phrase.start);
        // Split de tekst in woorden en voeg ze toe als individuele items
        const words = textBefore.replace(/\^/g, "").split(/(\s+|[,.!?;:()[\]{}'"–—-])/g);
        
        for (const word of words) {
          // Sla lege woorden en leestekens over voor selectie, maar behoud ze voor weergave
          if (word.trim() === "" || /^[,.!?;:()[\]{}'"–—-]$/.test(word)) {
            textItems.push({
              content: word,
              type: "word",
              index: -1, // Niet selecteerbaar
              isCorrect: false,
            });
          } else {
            textItems.push({
              content: word,
              type: "word",
              index: itemIndex++,
              isCorrect: false,
            });
          }
        }
      }
      
      // Voeg de frase toe als één item
      textItems.push({
        content: phrase.content,
        type: "phrase",
        index: itemIndex++,
        isCorrect: true,
      });
      
      lastEnd = phrase.end;
    });
    
    // Verwerk tekst na de laatste frase - nu ook woordgroepen tussen komma's
    if (lastEnd < question.markedText!.length) {
      const textAfter = question.markedText!.substring(lastEnd);
      
      // Split eerst op komma's om woordgroepen te vinden
      const commaGroups = textAfter.split(',');
      
      for (let i = 0; i < commaGroups.length; i++) {
        const group = commaGroups[i].trim();
        
        if (group) {
          // Als dit een woordgroep is (meerdere woorden), behandel als één item
          if (group.includes(' ')) {
            textItems.push({
              content: group,
              type: "phrase",
              index: itemIndex++,
              isCorrect: false,
            });
          } else {
            // Enkel woord
            textItems.push({
              content: group,
              type: "word",
              index: itemIndex++,
              isCorrect: false,
            });
          }
        }
      }
    }
    
    return textItems;
  };

  // Handle item click
  const handleItemClick = (item: TextItem) => {
    if (item.index === -1) {
      return;
    } // Niet-selecteerbare items overslaan
    
    setSelectedItems((prev) => {
      // Als het item al geselecteerd is, deselecteer het
      if (prev.includes(item.index)) {
        return prev.filter((i) => i !== item.index);
      }
      // Anders, selecteer het
      return [...prev, item.index];
    });
    
    // Update score
    setTimeout(updateScore, 50);
  };

  // Render de tekst met klikbare items
  const renderText = () => {
    if (!question.markedText) {
      return <p>No content available</p>;
    }
    if (error) {
      return <p className="text-red-600">{error}</p>;
    }
    
    const textItems = prepareTextItems();
    
    return (
      <div className="prose max-w-none">
        {textItems.map((item, index) => {
          // Niet-selecteerbare items (spaties, leestekens)
          if (item.index === -1) {
            return <span key={index}>{item.content}</span>;
          }
          
          // Selecteerbare items (woorden en frases)
          const isSelected = selectedItems.includes(item.index);
          
          // Bepaal de styling op basis van selectie en correctheid
          let className = "cursor-pointer px-0.5 py-0.5 rounded";
          
          if (isSelected) {
            className += item.isCorrect 
              ? " bg-green-500/20 text-green-700 dark:bg-green-500/20 dark:text-green-300" 
              : " bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-300";
          } else {
            className += " hover:bg-muted text-foreground";
          }
          
          return (
            <span
              key={index}
              className={className}
              onClick={() => handleItemClick(item)}
              data-is-correct={item.isCorrect}
              data-item-index={item.index}
            >
              {item.content}
            </span>
          );
        })}
      </div>
    );
  };

  // Update the score based on current selections
  const updateScore = () => {
    // Tel het aantal correcte items
    const textItems = prepareTextItems();
    const correctItems = textItems.filter((item) => item.isCorrect);
    const selectedCorrectItems = textItems.filter((item) => 
      item.isCorrect && selectedItems.includes(item.index),
    );
    
    if (correctItems.length > 0) {
      const calculatedScore = Math.round((selectedCorrectItems.length / correctItems.length) * 100);
      setScore(calculatedScore);
    } else {
      setScore(0);
    }
  };

  // Reset the question to try again
  const handleTryAgain = () => {
    setSelectedItems([]);
    setScore(0);
    setError(null);
  };

  // Calculate if all correct items are found and no incorrect items are selected
  const isAllCorrect = () => {
    const textItems = prepareTextItems();
    const correctItems = textItems.filter((item) => item.isCorrect);
    const selectedCorrectItems = textItems.filter((item) => 
      item.isCorrect && selectedItems.includes(item.index),
    );
    const selectedIncorrectItems = textItems.filter((item) => 
      !item.isCorrect && selectedItems.includes(item.index),
    );
    
    return selectedCorrectItems.length === correctItems.length && selectedIncorrectItems.length === 0;
  };

  // Handle submit button click
  const handleSubmit = () => {
    if (onSubmit) {
      // We geven de geselecteerde items door als strings
      const textItems = prepareTextItems();
      const selectedWords = selectedItems.map((index) => {
        const item = textItems.find((item) => item.index === index);
        return item ? item.content : "";
      }).filter(Boolean);
      
      onSubmit(selectedWords, isAllCorrect(), score);
    }
  };

  // Tel het aantal correcte items
  const countCorrectItems = () => {
    const textItems = prepareTextItems();
    return textItems.filter((item) => item.isCorrect).length;
  };

  // Tel het aantal geselecteerde correcte items
  const countSelectedCorrectItems = () => {
    const textItems = prepareTextItems();
    return textItems.filter((item) => 
      item.isCorrect && selectedItems.includes(item.index),
    ).length;
  };

  return (
    <div className="space-y-4">
      {/* Instruction */}
      <div className="bg-card border border-border p-4 rounded-md">
        <h3 className="text-center text-card-foreground font-medium">{question.instruction}</h3>
      </div>
      
      {/* Image */}
      {question.imageUrl && (
        <div className="flex justify-center my-4">
          <img 
            src={question.imageUrl} 
            alt="Vraag afbeelding" 
            className="max-w-full max-h-[300px] object-contain"
            style={question.imageSize ? {
              width: question.imageSize.width,
              height: question.imageSize.height,
            } : {}}
          />
        </div>
      )}
      
      {/* Score display */}
      <div className="bg-card border border-border p-4 rounded-md">
        <p className="font-medium text-card-foreground">
          Score: {score}%
          <span className="float-right">
            {countSelectedCorrectItems()} van de {countCorrectItems()} correcte items gevonden
          </span>
        </p>
      </div>
      
      {/* Text with clickable items */}
      <div className="bg-card border border-border p-6 rounded-md">
        {renderText()}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleTryAgain}>
          Opnieuw proberen
        </Button>
        {onSubmit && (
          <Button onClick={handleSubmit}>
            Indienen
          </Button>
        )}
      </div>
    </div>
  );
};
