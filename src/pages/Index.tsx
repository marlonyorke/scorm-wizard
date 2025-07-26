import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { EducationLevelSelector } from "@/components/dashboard/EducationLevelSelector";
import { SubjectYearSelector } from "@/components/dashboard/SubjectYearSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EducationLevel } from "@/types/education";

export default function Index() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const isSelectionComplete = Boolean(selectedLevel && selectedYear && selectedSubject);

  const handleNewQuiz = () => {
    navigate("/question-types");
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Selecteer niveau</h2>
            <EducationLevelSelector
              selectedLevel={selectedLevel}
              onSelectLevel={setSelectedLevel}
            />
          </div>

          <SubjectYearSelector
            selectedLevel={selectedLevel}
            selectedYear={selectedYear}
            selectedSubject={selectedSubject}
            onYearChange={setSelectedYear}
            onSubjectChange={setSelectedSubject}
          />

          <DashboardActions
            isSelectionComplete={isSelectionComplete}
            onNewQuiz={handleNewQuiz}
          />
        </CardContent>
      </Card>
    </div>
  );
}