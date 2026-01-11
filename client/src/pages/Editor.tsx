import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { useFloorplan, useDetectFeatures } from "@/hooks/use-floorplans";
import { useGenerateLayout } from "@/hooks/use-layouts";
import { Stage, Layer, Image as KonvaImage, Rect, Circle, Line } from "react-konva";
import useImage from "use-image";
import { Button } from "@/components/ui/button";
import { 
  Loader2, ArrowLeft, MousePointer, 
  Square, Layout as LayoutIcon, Wand2, 
  Maximize, Settings2, Download 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Editor() {
  const { id } = useParams();
  const floorplanId = Number(id);
  const { data: floorplan, isLoading } = useFloorplan(floorplanId);
  const { mutate: detectFeatures, isPending: isDetecting } = useDetectFeatures();
  const { mutate: generateLayout, isPending: isGenerating } = useGenerateLayout();
  const { toast } = useToast();

  const [activeTool, setActiveTool] = useState<'select' | 'wall' | 'zone'>('select');
  const [scale, setScale] = useState(1);
  const stageRef = useRef<any>(null);

  // Load floorplan image for Konva
  const [image] = useImage(floorplan?.imageUrl || "");

  const handleGenerate = () => {
    generateLayout({
      floorplanId,
      name: `Layout V${Math.floor(Math.random() * 100)}`,
      preferences: { style: "agile" }
    }, {
      onSuccess: () => toast({ title: "Success", description: "Layout generated! Check the comparison view." }),
      onError: () => toast({ title: "Error", description: "Failed to generate layout", variant: "destructive" })
    });
  };

  const handleDetect = () => {
    detectFeatures(floorplanId, {
      onSuccess: () => toast({ title: "Features Detected", description: "Walls and windows identified automatically." })
    });
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!floorplan) return <div>Floorplan not found</div>;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${floorplan.projectId}`} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="font-semibold">{floorplan.name}</h1>
            <p className="text-xs text-muted-foreground">Editor Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={handleDetect} disabled={isDetecting}>
            {isDetecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
            Auto-Detect Features
          </Button>
          <Button size="sm" onClick={handleGenerate} disabled={isGenerating} className="bg-gradient-to-r from-primary to-accent border-0">
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LayoutIcon className="w-4 h-4 mr-2" />}
            Generate Layouts
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-16 border-r border-border bg-card flex flex-col items-center py-4 gap-4 z-10">
          <ToolButton 
            active={activeTool === 'select'} 
            onClick={() => setActiveTool('select')} 
            icon={MousePointer} 
            label="Select" 
          />
          <ToolButton 
            active={activeTool === 'wall'} 
            onClick={() => setActiveTool('wall')} 
            icon={Square} 
            label="Wall" 
          />
          <ToolButton 
            active={activeTool === 'zone'} 
            onClick={() => setActiveTool('zone')} 
            icon={Maximize} 
            label="Zone" 
          />
          <div className="h-px w-8 bg-border my-2" />
          <ToolButton icon={Settings2} label="Settings" />
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 bg-muted/20 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <Stage 
              width={window.innerWidth - 320} 
              height={window.innerHeight - 64}
              scaleX={scale}
              scaleY={scale}
              draggable={activeTool === 'select'}
              onWheel={(e) => {
                e.evt.preventDefault();
                const scaleBy = 1.1;
                const oldScale = stageRef.current?.scaleX() || 1;
                const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
                setScale(newScale);
              }}
              ref={stageRef}
            >
              <Layer>
                {/* Background Image */}
                {image && (
                  <KonvaImage 
                    image={image} 
                    width={800} // In real app, calculate based on aspect ratio
                    height={600}
                    opacity={0.8}
                  />
                )}
                
                {/* Detected Features Overlay */}
                {/* @ts-ignore */}
                {floorplan.features?.walls?.map((wall: any, i: number) => (
                  <Line
                    key={i}
                    points={wall.points}
                    stroke="red"
                    strokeWidth={4}
                    opacity={0.5}
                  />
                ))}
              </Layer>
            </Stage>
          </div>

          {/* Canvas Controls */}
          <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg p-2 shadow-lg flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setScale(scale * 1.2)}>+</Button>
            <span className="flex items-center px-2 text-xs font-mono">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => setScale(scale / 1.2)}>-</Button>
          </div>
        </main>

        {/* Right Properties Panel */}
        <aside className="w-64 border-l border-border bg-card p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Properties</h3>
          
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">Selection</h4>
              <p className="text-xs text-muted-foreground">No element selected</p>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm">KPI Targets</h4>
              <div className="space-y-3">
                <KpiSlider label="Density" value={75} />
                <KpiSlider label="Meeting Rooms" value={40} />
                <KpiSlider label="Collaboration" value={60} />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button className="w-full" variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Export DXF
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ToolButton({ active, onClick, icon: Icon, label }: { active?: boolean, onClick?: () => void, icon: any, label: string }) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          "p-3 rounded-xl transition-all duration-200 hover:scale-105",
          active 
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="w-5 h-5" />
      </button>
      <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md border border-border z-50">
        {label}
      </span>
    </div>
  );
}

function KpiSlider({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary/70" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
