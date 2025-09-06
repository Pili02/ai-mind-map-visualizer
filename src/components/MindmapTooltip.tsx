import { Card } from "@/components/ui/card";

interface MindmapNode {
  id: number;
  title: string;
  description: string;
  children: MindmapNode[];
  resources?: string[];
}

interface MindmapTooltipProps {
  node: MindmapNode;
  position: { x: number; y: number };
}

export const MindmapTooltip = ({ node, position }: MindmapTooltipProps) => {
  return (
    <Card 
      className="absolute z-50 p-4 max-w-sm bg-card/95 backdrop-blur-sm border border-border/50 shadow-glow pointer-events-none"
      style={{
        left: position.x + 20,
        top: position.y - 10,
        transform: position.x > 600 ? 'translateX(-100%) translateX(-20px)' : 'none'
      }}
    >
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground text-sm leading-tight">
          {node.title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {node.description}
        </p>
        {node.children && node.children.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary">
              {node.children.length} subtopic{node.children.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};