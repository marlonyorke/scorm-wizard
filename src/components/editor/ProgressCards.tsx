import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuestions } from "@/contexts/QuestionsContext";

interface QuestionProgress {
  type: string;
  completed: number;
  total: number;
}

export function ProgressCards() {
  const { questions, selectedQuestionTypes } = useQuestions();

  // Tel het aantal vragen per type, maar alleen voor geselecteerde types
  const questionCounts = selectedQuestionTypes.reduce((acc, type) => ({
    ...acc,
    [type]: questions.filter((q) => q.type === type).length,
  }), {} as Record<string, number>);

  // Maak progress items voor geselecteerde vraagtypes
  const progress: QuestionProgress[] = Object.entries(questionCounts).map(([type, count]) => {
    const typeLabel = type === "multiple-choice" ? "Multiple Choice" :
      type === "drag-drop" ? "Drag & Drop" :
        type === "open" ? "Open Vragen" : type;
    
    return {
      type: typeLabel,
      completed: count,
      total: count,
    };
  });

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {progress.map((item) => (
        <Card key={item.type}>
          <CardHeader>
            <CardTitle className="text-lg">{item.type}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {item.completed}{" "}
              <span className="text-muted-foreground text-sm font-normal">
                vragen
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}