// API Diagnostische component voor het testen en debuggen van API-verbindingen
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import React, { useState } from "react";

import { collectDiagnostics } from "./api-utilities";
import openaiClient from "./openai-client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export const ApiDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openaiDebug, setOpenaiDebug] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const results = await collectDiagnostics();
      setDiagnostics(results);
    } catch (error) {
      console.error("Error running diagnostics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const runOpenAIDebug = async () => {
    setIsLoading(true);
    try {
      const results = await openaiClient.debugOpenAI();
      setOpenaiDebug(results);
    } catch (error) {
      console.error("Error debugging OpenAI:", error);
      setOpenaiDebug({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          API Diagnostiek
        </CardTitle>
        <CardDescription>
          Test en debug de API-verbindingen en OpenAI configuratie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basis Diagnostiek</TabsTrigger>
            <TabsTrigger value="advanced">Geavanceerde Debug</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="flex gap-4 mb-4">
              <Button onClick={runDiagnostics} disabled={isLoading}>
                {isLoading ? "Bezig met testen..." : "Start Diagnostiek"}
              </Button>
            </div>
            
            {diagnostics && (
              <div className="space-y-4">
                <StatusItem 
                  title="API Status" 
                  status={diagnostics.apiStatus.isAvailable} 
                  message={diagnostics.apiStatus.message}
                  details={diagnostics.apiStatus.details}
                />
                
                <StatusItem 
                  title="API Sleutel" 
                  status={diagnostics.apiKey.isValid} 
                  message={diagnostics.apiKey.message}
                  details={diagnostics.apiKey.details}
                />
                
                <StatusItem 
                  title="OpenAI Configuratie" 
                  status={diagnostics.openaiConfig.isConfigured} 
                  message={diagnostics.openaiConfig.message}
                  details={diagnostics.openaiConfig.details}
                />
                
                <Accordion type="single" collapsible>
                  <AccordionItem value="environment">
                    <AccordionTrigger>Omgevingsinformatie</AccordionTrigger>
                    <AccordionContent>
                      <pre className="bg-secondary p-4 rounded-md overflow-auto text-xs">
                        {JSON.stringify(diagnostics.environment, null, 2)}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="flex gap-4 mb-4">
              <Button onClick={runOpenAIDebug} disabled={isLoading} variant="outline">
                {isLoading ? "Bezig met debuggen..." : "Debug OpenAI Configuratie"}
              </Button>
            </div>
            
            {openaiDebug && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="openai-debug">
                  <AccordionTrigger>OpenAI Debug Resultaten</AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-secondary p-4 rounded-md overflow-auto text-xs">
                      {JSON.stringify(openaiDebug, null, 2)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Geavanceerde Diagnostiek</AlertTitle>
              <AlertDescription>
                Deze sectie is bedoeld voor geavanceerde debugging. De resultaten kunnen technische informatie bevatten.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          Laatste update: {diagnostics?.timestamp ? new Date(diagnostics.timestamp).toLocaleString() : "Nog niet uitgevoerd"}
        </div>
      </CardFooter>
    </Card>
  );
};

interface StatusItemProps {
  title: string;
  status: boolean;
  message: string;
  details?: any;
}

const StatusItem: React.FC<StatusItemProps> = ({ title, status, message, details }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {status ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        <h3 className="font-medium">{title}</h3>
        <Badge variant={status ? "success" : "destructive"}>
          {status ? "Geslaagd" : "Mislukt"}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground ml-7">{message}</p>
      
      {details && (
        <Accordion type="single" collapsible className="ml-7">
          <AccordionItem value="details">
            <AccordionTrigger className="text-xs">Details weergeven</AccordionTrigger>
            <AccordionContent>
              <pre className="bg-secondary p-2 rounded-md overflow-auto text-xs">
                {JSON.stringify(details, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

export default ApiDiagnostics;
