import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

interface DashboardActionsProps {
  isSelectionComplete: boolean;
  onNewQuiz: () => void;
}

export function DashboardActions({ isSelectionComplete, onNewQuiz }: DashboardActionsProps) {
  const navigate = useNavigate();

  const handleScormPreview = () => {
    navigate("/scorm");
  };

  return (
    <div className="flex flex-wrap gap-4 pt-4">
      <Button
        disabled={!isSelectionComplete}
        className="flex-1"
        variant="outline"
      >
        Toetsen
      </Button>
      <Button
        disabled={!isSelectionComplete}
        className="flex-1"
        onClick={onNewQuiz}
      >
        Nieuwe Toets
      </Button>
      <Button
        className="flex-1"
        variant="secondary"
        onClick={handleScormPreview}
      >
        SCORM Preview
      </Button>
    </div>
  );
}