import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface MindmapInputProps {
  onGenerate: (description: string) => void;
}

export const MindmapInput = ({ onGenerate }: MindmapInputProps) => {
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(description);
  };

  return (
    <Card className="p-8 shadow-card border-0 bg-card/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4 shadow-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Create Your Mindmap
          </h2>
          <p className="text-muted-foreground">
            Describe any topic and watch AI transform it into an interactive visualization
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Topic Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your topic description (e.g., 'I want description about music Kanmani')"
            className="min-h-32 resize-none border-2 border-border/50 focus:border-primary/50 focus:ring-primary/20 bg-background/50 backdrop-blur-sm text-base"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={!description.trim()}
          className="w-full bg-gradient-primary hover:bg-gradient-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-vibrant hover:shadow-glow transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Mindmap
        </Button>

        <div className="flex flex-wrap gap-2 justify-center">
          {[
            "Machine Learning Basics",
            "Sustainable Energy Solutions", 
            "Digital Marketing Strategies",
            "Classical Music History"
          ].map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setDescription(example)}
              className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {example}
            </button>
          ))}
        </div>
      </form>
    </Card>
  );
};