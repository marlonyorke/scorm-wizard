import { ResizableImage } from "./ResizableImage";

interface AnswerOptionProps {
  option: {
    id: string;
    text: string;
    mediaUrl?: string;
    imageSize?: {
      width: number;
      height: number;
    };
  };
  isSelected: boolean;
  isMultipleChoice: boolean;
  isDisabled: boolean;
  onSelect: (id: string) => void;
}

export function AnswerOption({
  option,
  isSelected,
  isMultipleChoice,
  isDisabled,
  onSelect,
}: AnswerOptionProps) {
  return (
    <div className="space-y-2">
      <div 
        className={`border rounded-lg p-3 transition-all cursor-pointer ${
          isDisabled ? "opacity-70 cursor-not-allowed" : ""
        } ${
          isSelected 
            ? "border-primary bg-primary/5 shadow-sm" 
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => !isDisabled && onSelect(option.id)}
      >
        <div className="flex items-center space-x-2">
          {isMultipleChoice ? (
            <div className={`w-5 h-5 flex items-center justify-center rounded border ${
              isSelected ? "border-primary bg-primary text-primary-foreground" : "border-gray-300"
            }`}>
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          ) : (
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
              isSelected ? "border-primary" : "border-gray-300"
            }`}>
              {isSelected && (
                <div className="w-3 h-3 rounded-full bg-primary" />
              )}
            </div>
          )}
          <span className="text-sm font-medium leading-none">
            {option.text}
          </span>
        </div>
        
        {option.mediaUrl && (
          <div className="mt-3">
            <ResizableImage
              src={option.mediaUrl}
              alt={`Afbeelding voor optie ${option.text}`}
              initialSize={option.imageSize}
              className="rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
