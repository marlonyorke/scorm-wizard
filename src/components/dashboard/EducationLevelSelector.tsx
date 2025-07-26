import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EducationLevel } from "@/types/education";

interface EducationLevelSelectorProps {
  selectedLevel: EducationLevel | null;
  onSelectLevel: (level: EducationLevel) => void;
}

const levels: EducationLevel[] = ["MAVO", "HAVO", "VWO"];

export function EducationLevelSelector({ selectedLevel, onSelectLevel }: EducationLevelSelectorProps) {
  return (
    <div className="flex gap-2">
      {levels.map((level) => (
        <Button
          key={level}
          onClick={() => onSelectLevel(level)}
          variant={selectedLevel === level ? "default" : "outline"}
          className={cn(
            "w-24",
            selectedLevel === level && "bg-green-500 hover:bg-green-600",
          )}
        >
          {level}
        </Button>
      ))}
    </div>
  );
}