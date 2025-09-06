import { useState } from "react";
import { MindmapInput } from "@/components/MindmapInput";
import { MindmapVisualization } from "@/components/MindmapVisualization";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";

interface MindmapData {
  root: string;
  nodes: Array<{
    id: number;
    title: string;
    description: string;
    children: any[];
    resources?: string[];
  }>;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mindmapData, setMindmapData] = useState<MindmapData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateMindmap = async (description: string) => {
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        "https://team-rahasya-upgrad-hackathon-backe-amber.vercel.app/api/v1/generate_mindmap",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate mindmap");
      }

      const data = await response.json();
      setMindmapData(data);
      toast.success("Mindmap generated successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMindmap = () => {
    setMindmapData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            AI Mindmap Visualizer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into beautiful, interactive mindmaps powered by AI
          </p>
        </header>

        {!mindmapData && !isLoading && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <MindmapInput onGenerate={handleGenerateMindmap} />
          </div>
        )}

        {isLoading && <LoadingState />}

        {mindmapData && !isLoading && (
          <div className="animate-zoom-in">
            <MindmapVisualization 
              data={mindmapData} 
              onNewMindmap={handleNewMindmap}
            />
          </div>
        )}

        {error && !isLoading && (
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={handleNewMindmap}
                className="bg-gradient-primary text-primary-foreground px-6 py-2 rounded-lg hover:shadow-vibrant transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;