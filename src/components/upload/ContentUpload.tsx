import { X, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { UploadedFile } from "@/types/upload";


export function ContentUpload() {
  const [lessonMaterial, setLessonMaterial] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const validTypes = [".pdf", ".docx", ".txt"];
      const isValidType = validTypes.some((type) => file.name.toLowerCase().endsWith(type));
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    const newUploadedFiles: UploadedFile[] = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const hasContent = lessonMaterial.trim().length > 0 || uploadedFiles.length > 0;

  const handleContinue = () => {
    navigate("/question-types");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Tabs defaultValue="document" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="document" className="flex-1">
            Document Upload
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex-1">
            AI Generatie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Plak lesmateriaal</h2>
                <Textarea
                  placeholder="Plak hier je lesmateriaal..."
                  value={lessonMaterial}
                  onChange={(e) => setLessonMaterial(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>

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
                    Sleep je lesmateriaal hierheen of
                  </p>
                  <label className="cursor-pointer text-primary hover:underline">
                    Kies Bestand(en)
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX, TXT tot 10MB per bestand
                  </p>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Geüploade Bestanden</h3>
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                        <span className="ml-2">Verwijder</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  disabled={!hasContent}
                  className="bg-green-500 hover:bg-green-600"
                  onClick={handleContinue}
                >
                  Ga naar vraagtype selectie →
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">AI Generatie functionaliteit komt binnenkort...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
