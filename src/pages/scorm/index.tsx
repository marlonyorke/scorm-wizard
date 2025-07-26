import { ArrowLeft, Upload } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScormProvider } from "@/contexts/ScormContext";
import { useToast } from "@/hooks/use-toast";
import ScormPlayer from "@/scorm-player/ScormPlayer";

const ScormPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [scormPackage, setScormPackage] = useState<File | null>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".zip")) {
      setScormPackage(file);
      toast({
        title: "SCORM pakket geüpload",
        description: `${file.name} is succesvol geüpload.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Fout bij uploaden",
        description: "Upload alstublieft een geldig SCORM pakket (.zip bestand)",
      });
    }
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".zip")) {
      setScormPackage(file);
      toast({
        title: "SCORM pakket geüpload",
        description: `${file.name} is succesvol geüpload.`,
      });
    }
  }, [toast]);

  return (
    <ScormProvider>
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar dashboard
            </Button>
          </div>
        </nav>
        <main className="container mx-auto p-6 space-y-6">
          {!scormPackage ? (
            <Card>
              <CardHeader>
                <CardTitle>Upload SCORM Pakket</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    isDragging ? "border-primary bg-primary/10" : "border-gray-300"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Sleep je SCORM pakket hierheen of
                    </p>
                    <label className="cursor-pointer text-primary hover:underline">
                      Kies Bestand
                      <input
                        type="file"
                        className="hidden"
                        accept=".zip"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="text-xs text-gray-500">
                      Alleen .zip bestanden worden geaccepteerd
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ScormPlayer scormPackage={scormPackage} />
          )}
        </main>
      </div>
    </ScormProvider>
  );
};

export default ScormPage;