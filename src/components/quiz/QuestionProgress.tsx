interface QuestionProgressProps {
  currentIndex: number;
  total: number;
}

export function QuestionProgress({ currentIndex, total }: QuestionProgressProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <span className="text-sm text-muted-foreground">
        Vraag {currentIndex + 1} van {total}
      </span>
    </div>
  );
}