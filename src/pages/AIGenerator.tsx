import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useQuestions } from "@/contexts/QuestionsContext";
import type { AIGenerationResponse} from "@/types/ai";
import { AIGenerationConfig, AIMultipleChoiceQuestion } from "@/types/ai";
import type { EducationLevel } from "@/types/education";

// Schema voor het formulier
const formSchema = z.object({
  educationLevel: z.enum(["primary", "secondary", "higher", "vocational"] as const),
  year: z.string().min(1, "Leerjaar is verplicht"),
  subject: z.string().min(1, "Vak is verplicht"),
  theme: z.string().optional(),
  chapter: z.string().optional(),
  batchSize: z.number().min(1).max(50),
  customMaterial: z.string().optional(),
});

export default function AIGenerator() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addQuestions } = useQuestions();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      educationLevel: "secondary" as EducationLevel,
      year: "3",
      subject: "",
      theme: "",
      chapter: "",
      batchSize: 5,
      customMaterial: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Er is een fout opgetreden bij het genereren van vragen");
      }

      const data: AIGenerationResponse = await response.json();
      
      // Voeg de gegenereerde vragen toe aan de context
      addQuestions(data.questions);
      
      toast({
        title: "Vragen gegenereerd",
        description: `${data.questions.length} vragen succesvol gegenereerd`,
      });
      
      // Navigeer naar de editor om de vragen te bewerken
      navigate("/editor");
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Fout bij genereren",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="container max-w-3xl py-10">
      <Card className="border-primary/20 bg-card/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">AI Vragengenerator</CardTitle>
          <CardDescription>
            Genereer automatisch multiple choice vragen op basis van jouw specificaties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="educationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Onderwijsniveau</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isGenerating}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer onderwijsniveau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="primary">Basisonderwijs</SelectItem>
                          <SelectItem value="secondary">Voortgezet onderwijs</SelectItem>
                          <SelectItem value="higher">Hoger onderwijs</SelectItem>
                          <SelectItem value="vocational">MBO</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leerjaar</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bijv. 3"
                          {...field}
                          disabled={isGenerating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vak</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv. Wiskunde, Nederlands, Biologie"
                        {...field}
                        disabled={isGenerating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thema (optioneel)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bijv. Tweede Wereldoorlog"
                          {...field}
                          disabled={isGenerating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chapter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hoofdstuk (optioneel)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bijv. Hoofdstuk 3"
                          {...field}
                          disabled={isGenerating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="batchSize"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Aantal vragen: {value}</FormLabel>
                    <FormControl>
                      <Slider
                        disabled={isGenerating}
                        min={1}
                        max={50}
                        step={1}
                        defaultValue={[value]}
                        onValueChange={(vals) => onChange(vals[0])}
                        {...fieldProps}
                      />
                    </FormControl>
                    <FormDescription>
                      Kies tussen 1 en 50 vragen om te genereren
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customMaterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesmateriaal (optioneel)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Plak hier je lesmateriaal om de vragen specifieker te maken"
                        className="min-h-32 resize-y"
                        {...field}
                        disabled={isGenerating}
                      />
                    </FormControl>
                    <FormDescription>
                      Voeg specifiek lesmateriaal toe om de AI te helpen relevantere vragen te genereren
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  disabled={isGenerating}
                >
                  Annuleren
                </Button>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Genereren...
                    </>
                  ) : (
                    "Genereer vragen"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col text-sm text-muted-foreground">
          <p>
            De AI-generator maakt gebruik van geavanceerde taalmodellen om hoogwaardige multiple choice vragen te genereren.
            De gegenereerde vragen zijn gebaseerd op het opgegeven onderwijsniveau, leerjaar en vak.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
