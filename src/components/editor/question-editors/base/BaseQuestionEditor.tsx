import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import type { Question } from "@/types/editor";


export interface BaseQuestionEditorProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
  showNameField?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export abstract class BaseQuestionEditor {
  static validateQuestion(question: Question): ValidationError[] {
    const errors: ValidationError[] = [];

    // Verwijder de naam validatie omdat deze functionaliteit is verwijderd
    // if (!question.name?.trim()) {
    //   errors.push({
    //     field: "name",
    //     message: "Geef de vraag een naam"
    //   });
    // }

    // Verwijder de verplichte vraagtekst validatie om geen foutmelding te tonen bij een lege vraag
    // if (!question.text?.trim()) {
    //   errors.push({
    //     field: "text",
    //     message: "Voer een vraag in"
    //   });
    // }

    return errors;
  }
}

export function BaseQuestionEditorComponent({
  currentQuestion,
  onQuestionChange,
  children,
  validationErrors = [],
  showNameField = true,
}: BaseQuestionEditorProps & {
  children?: React.ReactNode;
  validationErrors?: ValidationError[];
}) {
  const { toast } = useToast();

  const handleQuestionChange = (updatedQuestion: Question) => {
    console.log("Base editor handling question change:", updatedQuestion);
    onQuestionChange(updatedQuestion);
  };

  return (
    <div className="space-y-6">
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4">
              {validationErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {children}
    </div>
  );
}

export function withBaseQuestionEditor<P extends BaseQuestionEditorProps>(
  WrappedComponent: React.ComponentType<P>,
  validateQuestion?: (question: Question) => ValidationError[],
) {
  return function WithBaseQuestionEditorComponent(props: P) {
    const validationErrors = validateQuestion 
      ? validateQuestion(props.currentQuestion)
      : BaseQuestionEditor.validateQuestion(props.currentQuestion);

    return (
      <BaseQuestionEditorComponent
        currentQuestion={props.currentQuestion}
        onQuestionChange={props.onQuestionChange}
        validationErrors={validationErrors}
        showNameField={props.showNameField}
      >
        <WrappedComponent {...props} />
      </BaseQuestionEditorComponent>
    );
  };
}
