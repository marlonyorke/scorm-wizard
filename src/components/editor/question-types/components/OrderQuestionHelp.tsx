
import { HelpCircle } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const OrderQuestionHelp = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hoe werkt de Volgorde Editor?</DialogTitle>
          <DialogDescription className="space-y-3 pt-3">
            <p>Met de Volgorde Editor kunt u een vraag maken waarbij studenten items in de juiste volgorde moeten zetten.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Voer eerst de vraag in (bijvoorbeeld: "Zet de gebeurtenissen in chronologische volgorde")</li>
              <li>Voeg items toe die de student moet ordenen</li>
              <li>Sleep de items met de grip-handvat (≡) om de correcte volgorde te bepalen</li>
              <li>De volgorde waarin u de items plaatst wordt de correcte volgorde voor de vraag</li>
              <li>U kunt items toevoegen of verwijderen met de knoppen</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
