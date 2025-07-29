import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DevTools from "@/components/dev/DevTools";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { MockIndicator } from "@/components/ui/mock-indicator";
import { Toaster } from "@/components/ui/toaster";
import { QuestionsProvider } from "@/contexts/QuestionsContext";
import { ThemeProvider, ThemeInitializer } from "@/contexts/ThemeContext";
import Editor from "@/pages/editor";
import QuestionTypeSelection from "@/pages/QuestionTypeSelection";
import ScormPage from "@/pages/scorm";
import ErrorBoundary from "@/components/ErrorBoundary";

function App() {
  useEffect(() => {
    // Log all URL parameters for LTI debugging
    const urlParams = new URLSearchParams(window.location.search);
    const paramsObj = Object.fromEntries(urlParams.entries());
    console.log('[LTI DEBUG] URL Parameters:', paramsObj);
    
    // Check if LTI launch
    if (urlParams.get('lti') === 'success') {
      console.log('[LTI DEBUG] LTI Launch detected');
    } else {
      console.log('[LTI DEBUG] Regular access (not LTI)');
    }
  }, []);

  return (
    <ErrorBoundary componentName="SCORM Wizard App">
      <ThemeProvider>
        <QuestionsProvider>
          <ThemeInitializer />
          <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
            {/* Optionally add a label above the button showing the current theme name in the future */}
            <ThemeSwitcher />
          </div>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<QuestionTypeSelection />} />
              <Route path="/question-types" element={<Navigate to="/" replace />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/scorm" element={<ScormPage />} />
              <Route path="/ai-generator" element={<Navigate to="/" replace />} />
              <Route path="/multiple-choice-test" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
            <MockIndicator />
            <DevTools />
          </BrowserRouter>
        </QuestionsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;