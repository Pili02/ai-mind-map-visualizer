import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Sparkles } from "lucide-react";
import { MindmapTooltip } from "./MindmapTooltip";

interface MindmapNode {
  id: number;
  title: string;
  description: string;
  children: MindmapNode[];
  resources?: string[];
  x?: number;
  y?: number;
  level?: number;
  parent?: MindmapNode;
}

interface MindmapData {
  root: string;
  nodes: MindmapNode[];
}

interface MindmapVisualizationProps {
  data: MindmapData;
  onNewMindmap: () => void;
}

export const MindmapVisualization = ({ data, onNewMindmap }: MindmapVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const width = 1200;
  const height = 800;

  // Transform the data into a hierarchical structure
  const transformData = (data: MindmapData): MindmapNode => {
    const root: MindmapNode = {
      id: 0,
      title: data.root,
      description: `Main topic: ${data.root}`,
      children: data.nodes || [],
    };

    // Add level information and parent references
    const addLevelInfo = (node: MindmapNode, level: number = 0, parent?: MindmapNode) => {
      node.level = level;
      node.parent = parent;
      if (node.children) {
        node.children.forEach(child => addLevelInfo(child, level + 1, node));
      }
    };

    addLevelInfo(root);
    return root;
  };

  const getNodeColor = (level: number): string => {
    const colors = [
      'hsl(260, 85%, 60%)', // Primary - purple
      'hsl(180, 85%, 60%)', // Secondary - cyan  
      'hsl(30, 90%, 65%)',  // Tertiary - orange
      'hsl(120, 70%, 55%)', // Quaternary - green
      'hsl(300, 80%, 65%)', // Quinary - pink
    ];
    return colors[level % colors.length];
  };

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");
    
    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Transform data
    const rootNode = transformData(data);

    // Create hierarchy and layout
    const hierarchy = d3.hierarchy(rootNode, d => d.children);
    
    // Use a radial tree layout
    const treeLayout = d3.tree<MindmapNode>()
      .size([2 * Math.PI, Math.min(width, height) / 2 - 100])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const treeData = treeLayout(hierarchy);

    // Convert polar to cartesian coordinates
    treeData.descendants().forEach(d => {
      if (d.depth === 0) {
        d.x = 0;
        d.y = 0;
      } else {
        const angle = d.x;
        const radius = d.y;
        d.x = radius * Math.cos(angle - Math.PI / 2);
        d.y = radius * Math.sin(angle - Math.PI / 2);
      }
    });

    // Center the visualization
    g.attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Draw links after coordinate conversion
    const links = g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d => {
        const source = d.source;
        const target = d.target;
        return `M${source.x},${source.y}C${source.x},${(source.y + target.y) / 2} ${target.x},${(source.y + target.y) / 2} ${target.x},${target.y}`;
      })
      .attr("fill", "none")
      .attr("stroke", "hsl(240, 20%, 80%)")
      .attr("stroke-width", 2)
      .attr("opacity", 0.6);

    // Draw nodes
    const nodes = g.selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer");

    // Add circles for nodes
    nodes.append("circle")
      .attr("r", d => Math.max(20, 40 - d.depth * 8))
      .attr("fill", d => getNodeColor(d.depth))
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("opacity", 0.9)
      .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.2))")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", Math.max(25, 45 - d.depth * 8))
          .style("filter", "drop-shadow(0 6px 12px rgba(0,0,0,0.3))");
          
        // Show tooltip
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPosition({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          });
          setSelectedNode(d.data);
        }
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", Math.max(20, 40 - d.depth * 8))
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.2))");
          
        setSelectedNode(null);
      });

    // Add text labels
    nodes.append("text")
      .attr("dy", "0.31em")
      .attr("text-anchor", "middle")
      .text(d => {
        const maxLength = Math.max(8, 20 - d.depth * 3);
        return d.data.title.length > maxLength 
          ? d.data.title.substring(0, maxLength) + "..." 
          : d.data.title;
      })
      .attr("font-size", d => Math.max(10, 14 - d.depth * 2))
      .attr("font-weight", "600")
      .attr("fill", "white")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 3px rgba(0,0,0,0.5)");

    // Add entrance animation
    nodes.style("opacity", 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .style("opacity", 1)
      .attr("transform", d => `translate(${d.x}, ${d.y}) scale(1)`)
      .ease(d3.easeBackOut);

    links.style("opacity", 0)
      .transition()
      .duration(1000)
      .delay(500)
      .style("opacity", 0.6);

    // Zoom controls
    const zoomIn = () => svg.transition().call(zoom.scaleBy, 1.5);
    const zoomOut = () => svg.transition().call(zoom.scaleBy, 1 / 1.5);
    const resetZoom = () => svg.transition().call(zoom.transform, d3.zoomIdentity);

    // Expose zoom functions to component
    (svg.node() as any).__zoomIn = zoomIn;
    (svg.node() as any).__zoomOut = zoomOut;
    (svg.node() as any).__resetZoom = resetZoom;

  }, [data, width, height]);

  const handleZoomIn = () => {
    const svg = svgRef.current;
    if (svg && (svg as any).__zoomIn) {
      (svg as any).__zoomIn();
    }
  };

  const handleZoomOut = () => {
    const svg = svgRef.current;
    if (svg && (svg as any).__zoomOut) {
      (svg as any).__zoomOut();
    }
  };

  const handleResetZoom = () => {
    const svg = svgRef.current;
    if (svg && (svg as any).__resetZoom) {
      (svg as any).__resetZoom();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Mindmap</h2>
          <p className="text-muted-foreground">Explore the connections • Hover for details • Zoom and pan to navigate</p>
        </div>
        <Button
          onClick={onNewMindmap}
          className="bg-gradient-accent hover:bg-gradient-accent text-accent-foreground shadow-vibrant hover:shadow-glow transition-all duration-300"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          New Mindmap
        </Button>
      </div>

      {/* Visualization Container */}
      <Card className="p-6 shadow-card border-0 bg-card/30 backdrop-blur-sm relative">
        <div ref={containerRef} className="relative">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="bg-gradient-to-br from-background/50 to-muted/30 rounded-lg border border-border/20"
          />
          
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              size="sm"
              onClick={handleZoomIn}
              className="bg-card/80 hover:bg-card text-foreground border border-border/50 shadow-sm"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleZoomOut}
              className="bg-card/80 hover:bg-card text-foreground border border-border/50 shadow-sm"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleResetZoom}
              className="bg-card/80 hover:bg-card text-foreground border border-border/50 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Tooltip */}
          {selectedNode && (
            <MindmapTooltip
              node={selectedNode}
              position={tooltipPosition}
            />
          )}
        </div>
      </Card>
    </div>
  );
};