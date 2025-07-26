import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface FeedbackAlertProps {
  feedback?: string;
  variant?: "success" | "error" | "warning" | "info";
  children?: React.ReactNode;
  isCorrect?: boolean;
  correctMessage?: string;
  incorrectMessage?: string;
}

export function FeedbackAlert({ 
  feedback, 
  variant: propVariant, 
  children, 
  isCorrect, 
  correctMessage, 
  incorrectMessage, 
}: FeedbackAlertProps) {
  // Bepaal de variant op basis van isCorrect, als dat is meegegeven
  let variant = propVariant;
  
  if (isCorrect !== undefined) {
    variant = isCorrect ? "success" : "error";
  }
  
  // Bepaal de feedback tekst op basis van isCorrect, als dat is meegegeven
  let feedbackText = feedback;
  
  if (isCorrect !== undefined) {
    feedbackText = isCorrect ? correctMessage : incorrectMessage;
  }
  
  // Bepaal de styling op basis van de variant
  let alertClasses = "mt-4 ";
  
  switch (variant) {
    case "success":
      alertClasses += "bg-green-100 border-green-300 text-green-800";
      break;
    case "error":
      alertClasses += "bg-red-100 border-red-300 text-red-800";
      break;
    case "warning":
      alertClasses += "bg-yellow-100 border-yellow-300 text-yellow-800";
      break;
    case "info":
    default:
      alertClasses += "bg-gradient-to-r from-secondary/20 to-primary/20 border-primary/30";
      break;
  }
  
  return (
    <Alert className={alertClasses}>
      <AlertTitle className="font-semibold">Feedback</AlertTitle>
      <AlertDescription>
        {children || feedbackText || feedback}
      </AlertDescription>
    </Alert>
  );
}
