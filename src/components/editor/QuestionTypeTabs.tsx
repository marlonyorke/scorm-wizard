import { ListChecks, GripHorizontal, MessageSquare, TextSelect, GitMerge, ArrowUpDown, Video, Edit3, Target } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useQuestions } from "@/contexts/QuestionsContext";

type QuestionType = "multiple-choice" | "matching" | "order" | "drag-drop" | "video-interactive" | "mark-words" | "hotspot" | "open";

export function QuestionTypeTabs() {
  const { 
    selectedQuestionTypes, 
    questions, 
    currentQuestion,
    changeQuestionType,
    createInitialQuestion,
  } = useQuestions();
  const { toast } = useToast();

  const typeIcons = {
    "multiple-choice": ListChecks,
    "matching": GitMerge,
    "order": ArrowUpDown,
    "drag-drop": GripHorizontal,
    "video-interactive": Video,
    "mark-words": Edit3,
    "hotspot": Target,
    "open": MessageSquare,
  } as const;

  const typeLabels = {
    "multiple-choice": "Multiple Choice",
    "matching": "Matching",
    "order": "Volgorde",
    "drag-drop": "Drag & Drop",
    "video-interactive": "Interactieve Video",
    "mark-words": "Markeer Woorden",
    "hotspot": "Hotspot",
    "open": "Open vraag",
  } as const;

  const handleTypeChange = (type: string) => {
    console.log("Tab changed to:", type);
    
    if (currentQuestion?.type === type) {
      console.log("Already on this type, no change needed");
      return;
    }

    if (isValidQuestionType(type)) {
      const newQuestion = createInitialQuestion(type);
      changeQuestionType(type);
      
      toast({
        title: "Vraagtype gewijzigd",
        description: `Vraagtype is gewijzigd naar ${typeLabels[type]}`,
      });
    }
  };

  const isValidQuestionType = (type: string): type is QuestionType => {
    return type in typeIcons;
  };

  const questionCounts = selectedQuestionTypes.reduce((acc, type) => ({
    ...acc,
    [type]: questions.filter((q) => q.type === type).length,
  }), {} as Record<string, number>);

  return (
    <Tabs 
      value={currentQuestion?.type}
      className="w-full"
      onValueChange={handleTypeChange}
    >
      <TabsList className="w-full flex flex-wrap gap-2 justify-start mb-6 p-2 h-auto min-h-[2.5rem]">
        {selectedQuestionTypes.map((type) => {
          if (!isValidQuestionType(type)) {
            return null;
          }
          
          const Icon = typeIcons[type];
          const label = typeLabels[type];
          
          return (
            <TabsTrigger 
              key={type}
              value={type} 
              className="flex items-center gap-2 shrink-0"
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{label}</span>
              <span className="ml-2 text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                {questionCounts[type] || 0}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
