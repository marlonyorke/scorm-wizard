import JSZip from "jszip";
import { AlertCircle } from "lucide-react";
import React, { useEffect, useCallback, useRef, useState } from "react";

import ScormDebugger from "./components/ScormDebugger";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScorm } from "@/contexts/ScormContext";
import { ScormBridge } from "@/utils/scorm/bridge";


interface ScormPlayerProps {
  scormPackage?: File;
}

const ScormPlayer: React.FC<ScormPlayerProps> = ({ scormPackage }) => {
  const { state, initialize, terminate } = useScorm();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const bridgeRef = useRef<ScormBridge>(new ScormBridge());
  const [isLoaded, setIsLoaded] = useState(false);

  const initializeScorm = useCallback(() => {
    if (!state.initialized) {
      initialize();
    }
  }, [state.initialized, initialize]);

  const terminateScorm = useCallback(() => {
    if (state.initialized) {
      terminate();
    }
  }, [state.initialized, terminate]);

  useEffect(() => {
    if (scormPackage && iframeRef.current && !isLoaded) {
      const loadScormPackage = async () => {
        try {
          const zip = new JSZip();
          const contents = await zip.loadAsync(scormPackage);
          
          const files: { [key: string]: string } = {};
          let indexHtmlContent = "";
          
          for (const [path, file] of Object.entries(contents.files)) {
            if (!file.dir) {
              if (path.endsWith("index.html")) {
                indexHtmlContent = await file.async("text");
              } else {
                const content = await file.async("blob");
                const url = URL.createObjectURL(content);
                files[path] = url;
              }
            }
          }

          const scormApiScript = `
            <script>
              window.API = {
                LMSInitialize: function(str) { 
                  window.parent.postMessage({ type: 'LMSInitialize', parameter: str }, '*');
                  return 'true';
                },
                LMSFinish: function(str) {
                  window.parent.postMessage({ type: 'LMSFinish', parameter: str }, '*');
                  return 'true';
                },
                LMSGetValue: function(element) {
                  window.parent.postMessage({ type: 'LMSGetValue', parameter: element }, '*');
                  return '';
                },
                LMSSetValue: function(element, value) {
                  window.parent.postMessage({ type: 'LMSSetValue', parameters: { element, value } }, '*');
                  return 'true';
                },
                LMSCommit: function(str) {
                  window.parent.postMessage({ type: 'LMSCommit', parameter: str }, '*');
                  return 'true';
                },
                LMSGetLastError: function() {
                  return '0';
                },
                LMSGetErrorString: function(errorCode) {
                  return 'No error';
                },
                LMSGetDiagnostic: function(errorCode) {
                  return 'No error';
                }
              };
            </script>
          `;

          const modifiedContent = indexHtmlContent.replace("</head>", `${scormApiScript}</head>`);
          const blob = new Blob([modifiedContent], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          
          if (iframeRef.current) {
            iframeRef.current.src = url;
            setIsLoaded(true);
          }

          const handleMessage = (event: MessageEvent) => {
            if (event.source === iframeRef.current?.contentWindow) {
              const { type, parameter, parameters } = event.data;
              
              switch (type) {
                case "LMSInitialize":
                  initializeScorm();
                  break;
                case "LMSSetValue":
                  if (parameters && state.api) {
                    state.api.LMSSetValue(parameters.element, parameters.value);
                  }
                  break;
                case "LMSCommit":
                  if (state.api) {
                    state.api.LMSCommit("");
                  }
                  break;
                case "LMSFinish":
                  terminateScorm();
                  break;
              }
            }
          };

          window.addEventListener("message", handleMessage);
          return () => {
            window.removeEventListener("message", handleMessage);
            URL.revokeObjectURL(url);
            Object.values(files).forEach(URL.revokeObjectURL);
          };
        } catch (error) {
          console.error("Error loading SCORM package:", error);
        }
      };

      loadScormPackage();
    }
  }, [scormPackage, initializeScorm, terminateScorm, state.api, isLoaded]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>SCORM Player</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {state.error}
              </AlertDescription>
            </Alert>
          )}
          
          {!state.initialized && !state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                SCORM niet geïnitialiseerd. Controleer de verbinding met het LMS.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="relative w-full aspect-video bg-white rounded-lg shadow-sm overflow-hidden">
            <iframe
              ref={iframeRef}
              title="SCORM Content"
              className="absolute inset-0 w-full h-full border-0"
              src="about:blank"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">Status: <span className="font-medium text-gray-900">{state.status}</span></p>
            <p className="text-sm text-gray-500">Score: <span className="font-medium text-gray-900">{state.score}</span></p>
            {state.error && (
              <p className="text-sm text-red-500">Error: <span className="font-medium">{state.error}</span></p>
            )}
          </div>
        </CardContent>
      </Card>
      <ScormDebugger />
    </div>
  );
};

export default ScormPlayer;