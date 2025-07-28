import { Bug, Terminal, Database, AlertCircle } from "lucide-react";
import React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScorm } from "@/contexts/ScormContext";

const ScormDebugger: React.FC = () => {
  const { state, setScore, setStatus, setSuspendData } = useScorm();

  const handleTestScore = () => {
    const newScore = Math.floor(Math.random() * 100);
    setScore(newScore);
  };

  const handleTestStatus = () => {
    const statuses: Array<typeof state.status> = [
      "not attempted",
      "incomplete",
      "completed",
      "failed",
      "passed",
    ];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    setStatus(randomStatus);
  };

  const handleTestSuspendData = () => {
    const testData = JSON.stringify({
      lastVisited: new Date().toISOString(),
      progress: Math.random(),
      testId: Math.floor(Math.random() * 1000),
    });
    setSuspendData(testData);
  };

  return (
    <Card className="bg-slate-50">
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <Bug className="h-5 w-5 text-slate-600" />
          <CardTitle>SCORM Debugger</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!state.initialized && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              SCORM niet geïnitialiseerd
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-start space-x-2">
            <Terminal className="h-4 w-4 text-slate-600 mt-1" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Status</p>
              <div className="rounded bg-slate-100 p-2">
                <code className="text-xs">{state.status}</code>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Database className="h-4 w-4 text-slate-600 mt-1" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Data</p>
              <div className="space-y-2">
                <div className="rounded bg-slate-100 p-2">
                  <p className="text-xs font-medium text-slate-600">Score</p>
                  <code className="text-xs">{state.score}</code>
                </div>
                <div className="rounded bg-slate-100 p-2">
                  <p className="text-xs font-medium text-slate-600">Suspend Data</p>
                  <code className="text-xs break-all">
                    {state.suspendData || "Geen data"}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleTestScore}
            data-testid="test-score"
          >
            Test Score
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleTestStatus}
            data-testid="test-status"
          >
            Test Status
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleTestSuspendData}
            data-testid="test-suspend-data"
          >
            Test Suspend Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScormDebugger;