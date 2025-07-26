import { Dialog, DialogContent } from "@/components/ui/dialog";

interface QuestionMediaProps {
  mediaUrl: string | undefined;
  isDialogOpen: boolean;
  onDialogChange: (open: boolean) => void;
}

export function QuestionMedia({ 
  mediaUrl, 
  isDialogOpen, 
  onDialogChange, 
}: QuestionMediaProps) {
  if (!mediaUrl) {
    return null;
  }

  return (
    <>
      <div 
        className="cursor-pointer" 
        onClick={() => onDialogChange(true)}
      >
        <img 
          src={mediaUrl} 
          alt="Vraag afbeelding" 
          className="max-w-[300px] h-auto rounded-lg hover:scale-102 transition-transform"
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <img 
            src={mediaUrl} 
            alt="Vergrote afbeelding" 
            className="w-full h-auto rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}