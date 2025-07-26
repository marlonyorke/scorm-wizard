import { useState } from "react";

import { MultipleChoicePreview } from "@/components/questions/preview/MultipleChoicePreview";
import type { QuestionOption } from "@/types/editor";

export default function MultipleChoiceTest() {
  // Voorbeeld vraag 1
  const question1Options: QuestionOption[] = [
    {
      id: "option1",
      text: "Zuurstof en Water",
      isCorrect: true,
      feedback: "Correct! Planten hebben zuurstof en water nodig voor fotosynthese. Water wordt opgenomen door de wortels en zuurstof wordt gebruikt in het proces.",
    },
    {
      id: "option2",
      text: "Koolstofdioxide en Water",
      isCorrect: false,
      feedback: "Niet correct. Planten hebben inderdaad water nodig, maar ze gebruiken koolstofdioxide (CO2) in plaats van zuurstof voor fotosynthese. Planten nemen CO2 op via hun huidmondjes en zetten dit samen met water om in glucose en zuurstof.",
    },
    {
      id: "option3",
      text: "Stikstof en Zuurstof",
      isCorrect: false,
      feedback: "Niet correct. Hoewel planten stikstof nodig hebben voor groei (voor eiwitten en DNA), is het geen directe component van fotosynthese. Voor fotosynthese hebben planten koolstofdioxide en water nodig.",
    },
    {
      id: "option4",
      text: "Koolstofdioxide en Stikstof",
      isCorrect: false,
      feedback: "Niet correct. Planten hebben koolstofdioxide nodig voor fotosynthese, maar stikstof is niet direct betrokken bij het fotosynthese proces. Water is de andere essentiële component.",
    },
  ];

  // Voorbeeld vraag 2
  const question2Options: QuestionOption[] = [
    {
      id: "option1",
      text: "Zuurstof",
      isCorrect: false,
      feedback: "Niet correct. Zuurstof is een bijproduct van fotosynthese, niet het belangrijkste product voor plantengroei.",
    },
    {
      id: "option2",
      text: "Water",
      isCorrect: false,
      feedback: "Niet correct. Water is een grondstof voor fotosynthese, niet het eindproduct dat cruciaal is voor plantengroei.",
    },
    {
      id: "option3",
      text: "Glucose",
      isCorrect: true,
      feedback: "Correct! Glucose (suiker) is het belangrijkste product van fotosynthese dat planten gebruiken voor energie en groei. Planten zetten glucose om in cellulose, zetmeel en andere verbindingen die nodig zijn voor groei.",
    },
    {
      id: "option4",
      text: "Koolstofdioxide",
      isCorrect: false,
      feedback: "Niet correct. Koolstofdioxide is een grondstof voor fotosynthese, niet het eindproduct dat cruciaal is voor plantengroei.",
    },
  ];

  // Voorbeeld vraag 3 - meerkeuze
  const question3Options: QuestionOption[] = [
    {
      id: "option1",
      text: "Fotosynthese",
      isCorrect: true,
      feedback: "Correct! Fotosynthese is een proces waarbij planten lichtenergie omzetten in chemische energie.",
    },
    {
      id: "option2",
      text: "Celademhaling",
      isCorrect: true,
      feedback: "Correct! Celademhaling is het proces waarbij planten glucose afbreken om energie vrij te maken.",
    },
    {
      id: "option3",
      text: "Fermentatie",
      isCorrect: false,
      feedback: "Niet correct. Fermentatie is een anaeroob proces dat voornamelijk door bacteriën en gist wordt gebruikt, niet door planten onder normale omstandigheden.",
    },
    {
      id: "option4",
      text: "Transpiratie",
      isCorrect: true,
      feedback: "Correct! Transpiratie is het proces waarbij planten water verdampen via hun bladeren, wat helpt bij het transport van voedingsstoffen.",
    },
  ];

  return (
    <div className="dark-mode min-h-screen bg-primary-bg text-primary-text p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-primary-accent">Multiple Choice Test</h1>
        
        <div className="space-y-8">
          {/* Vraag 1 */}
          <div className="rounded-lg overflow-hidden border border-border-color p-4">
            <h2 className="text-xl font-semibold mb-4 text-secondary-accent">Vraag 1: Enkelvoudige keuze</h2>
            <MultipleChoicePreview
              text="Welke twee stoffen zijn nodig voor fotosynthese in planten?"
              options={question1Options}
              multipleCorrect={false}
            />
          </div>
          
          {/* Vraag 2 */}
          <div className="rounded-lg overflow-hidden border border-border-color p-4">
            <h2 className="text-xl font-semibold mb-4 text-secondary-accent">Vraag 2: Enkelvoudige keuze</h2>
            <MultipleChoicePreview
              text="Wat is het belangrijkste product van fotosynthese dat voor planten van cruciaal belang is voor hun groei?"
              options={question2Options}
              multipleCorrect={false}
            />
          </div>
          
          {/* Vraag 3 */}
          <div className="rounded-lg overflow-hidden border border-border-color p-4">
            <h2 className="text-xl font-semibold mb-4 text-secondary-accent">Vraag 3: Meerkeuze</h2>
            <MultipleChoicePreview
              text="Welke van de volgende processen komen voor bij planten? (Selecteer alle juiste antwoorden)"
              options={question3Options}
              multipleCorrect={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
