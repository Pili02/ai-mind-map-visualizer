import { Card } from "@/components/ui/card";
import { Loader2, Brain, Sparkles } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="p-8 shadow-card border-0 bg-card/50 backdrop-blur-sm text-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-glow">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <Loader2 className="w-8 h-8 text-primary absolute -top-2 -right-2 animate-spin" />
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              AI is Crafting Your Mindmap
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Analyzing your topic and creating beautiful interconnected nodes...
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>This usually takes 10-30 seconds</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>

          <div className="w-full max-w-xs bg-muted/30 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-primary rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      </Card>
    </div>
  );
};