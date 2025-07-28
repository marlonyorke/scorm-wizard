
import * as Icons from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuestionTypeCardProps } from "@/types/questions";


export function QuestionTypeCard({ type, isSelected, onSelect }: QuestionTypeCardProps) {
  const IconComponent = (Icons as any)[type.icon];

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 cursor-pointer group glass-card ${
        isSelected 
          ? "border-primary/50 gold-glow" 
          : "hover:gold-glow border-transparent"
      }`}
      onClick={() => onSelect(type.id)}
    >
      <div className={`absolute inset-0 bg-primary/5 opacity-0 transition-opacity duration-300 ${
        isSelected ? "opacity-100" : "group-hover:opacity-100"
      }`} />
      
      <CardContent className="relative p-6 z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`p-3 rounded-xl ${
            isSelected 
              ? "bg-primary/20 text-primary" 
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          } transition-colors duration-300`}>
            <IconComponent className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className={`font-semibold text-lg ${
              isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
            }`}>
              {type.name}
            </h3>
            
            <Button 
              variant="link" 
              className={`text-sm ${
                isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              }`}
            >
              Preview
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
