import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { useFloorplan, useDetectFeatures } from "@/hooks/use-floorplans";
import { useGenerateLayout, useLayouts } from "@/hooks/use-layouts";
import { Stage, Layer, Image as KonvaImage, Rect, Circle, Line, Group, Text } from "react-konva";
import useImage from "use-image";
import { Button } from "@/components/ui/button";
import { 
  Loader2, ArrowLeft, MousePointer, 
  Square, Layout as LayoutIcon, Wand2, 
  Maximize, Settings2, Download, 
  ZoomIn, ZoomOut, Save, RefreshCw, PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

export default function Editor() {
  const { id } = useParams();
  const floorplanId = Number(id);
  const { data: floorplan, isLoading } = useFloorplan(floorplanId);
  const { mutate: detectFeatures, isPending: isDetecting } = useDetectFeatures();
  const { mutate: generateLayout, isPending: isGenerating } = useGenerateLayout();
  const { data: layouts } = useLayouts(floorplanId);
  const { toast } = useToast();

  const [activeTool, setActiveTool] = useState<'select' | 'wall' | 'zone'>('select');
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [selectedLayoutId, setSelectedLayoutId] = useState<number | null>(null);
  const stageRef = useRef<any>(null);

  const selectedLayout = layouts?.find(l => l.id === selectedLayoutId) || layouts?.[0];

  const [image] = useImage(floorplan?.imageUrl || "");

  const handleGenerate = () => {
    generateLayout({
      floorplanId,
      name: `Layout ${layouts ? layouts.length + 1 : 1}`,
      preferences: { style: "agile" }
    }, {
      onSuccess: (data) => {
        setSelectedLayoutId(data.id);
        toast({ title: "Success", description: "New layout generated based on headcount requirements." });
      }
    });
  };

  const handleDetect = () => {
    detectFeatures(floorplanId, {
      onSuccess: () => toast({ title: "Detection Complete", description: "Architectural features identified." })
    });
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!floorplan) return <div>Floorplan not found</div>;

  const kpiData = selectedLayout?.kpiScores ? [
    { subject: 'Efficiency', A: selectedLayout.kpiScores.spaceEfficiency },
    { subject: 'Cost', A: selectedLayout.kpiScores.costEfficiency },
    { subject: 'Carbon', A: selectedLayout.kpiScores.carbonEfficiency },
    { subject: 'Productivity', A: selectedLayout.kpiScores.productivityIndex },
    { subject: 'Collab', A: selectedLayout.kpiScores.collaborationScore },
    { subject: 'Comfort', A: selectedLayout.kpiScores.comfortIndex },
  ] : [];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${floorplan.projectId}`} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-lg">{floorplan.name}</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-xs text-muted-foreground font-medium">Drafting Mode</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleDetect} disabled={isDetecting}>
            {isDetecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2 text-primary" />}
            Scan Floorplan
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button size="sm" onClick={handleGenerate} disabled={isGenerating} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Generate Layout
          </Button>
          <Button size="sm" variant="secondary">
            <Save className="w-4 h-4 mr-2" />
            Freeze Layout
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-20 border-r border-border bg-card flex flex-col items-center py-6 gap-6 z-10">
          <ToolButton active={activeTool === 'select'} onClick={() => setActiveTool('select')} icon={MousePointer} label="Select" />
          <ToolButton active={activeTool === 'wall'} onClick={() => setActiveTool('wall')} icon={Square} label="Walls" />
          <ToolButton active={activeTool === 'zone'} onClick={() => setActiveTool('zone')} icon={Maximize} label="Zoning" />
          <div className="h-px w-10 bg-border my-2" />
          <ToolButton icon={Settings2} label="Settings" />
        </aside>

        <main className="flex-1 bg-muted/10 relative overflow-hidden group">
          <Stage 
            width={window.innerWidth - 340} 
            height={window.innerHeight - 64}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            draggable={activeTool === 'select'}
            onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
            ref={stageRef}
            className="cursor-crosshair"
          >
            <Layer>
              {image && (
                <KonvaImage 
                  image={image} 
                  width={image.width} 
                  height={image.height}
                  opacity={0.4}
                />
              )}
              
              {/* Floorplan Features */}
              {floorplan.features?.walls?.map((wall: any, i: number) => (
                <Line key={`wall-${i}`} points={wall.points} stroke="#475569" strokeWidth={3} lineCap="round" lineJoin="round" />
              ))}

              {/* Layout Zoning */}
              {selectedLayout?.zoningData?.zones?.map((zone: any, i: number) => (
                <Group key={`zone-${i}`}>
                  <Rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} fill={zone.color} opacity={0.3} stroke={zone.color} strokeWidth={2} />
                  <Text x={zone.x + 5} y={zone.y + 5} text={zone.name} fontSize={14} fill={zone.color} fontStyle="bold" />
                </Group>
              ))}
            </Layer>
          </Stage>

          <div className="absolute bottom-6 left-6 flex gap-2">
             {layouts?.map((l) => (
               <Button 
                key={l.id} 
                variant={selectedLayoutId === l.id ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs font-bold"
                onClick={() => setSelectedLayoutId(l.id)}
               >
                 Option {l.id}
               </Button>
             ))}
          </div>

          <div className="absolute bottom-6 right-6 bg-card border border-border rounded-xl p-1.5 shadow-xl flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(scale * 1.2)}><ZoomIn className="w-4 h-4" /></Button>
            <div className="flex items-center px-2 text-[10px] font-mono font-bold text-muted-foreground">{Math.round(scale * 100)}%</div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(scale / 1.2)}><ZoomOut className="w-4 h-4" /></Button>
          </div>
        </main>

        <aside className="w-80 border-l border-border bg-card flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-display font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">Performance Score</h3>
            {kpiData.length > 0 ? (
              <div className="h-64 -mx-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={kpiData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <Radar
                      name="Layout"
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4 bg-muted/20 rounded-xl border border-dashed border-border">
                <PieChart className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Generate a layout to see performance metrics</p>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-8">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Optimization Weights</h4>
              <div className="space-y-4">
                <KpiSlider label="Space Efficiency" value={selectedLayout?.kpiScores?.spaceEfficiency || 0} color="bg-blue-500" />
                <KpiSlider label="Collaboration" value={selectedLayout?.kpiScores?.collaborationScore || 0} color="bg-purple-500" />
                <KpiSlider label="Comfort Index" value={selectedLayout?.kpiScores?.comfortIndex || 0} color="bg-emerald-500" />
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <Button className="w-full h-11 font-bold shadow-lg shadow-primary/10" variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Export Reports
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
          "p-3.5 rounded-2xl transition-all duration-300 hover:scale-110",
          active 
            ? "bg-primary text-primary-foreground shadow-xl shadow-primary/30 rotate-0" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground hover:rotate-3"
        )}
      >
        <Icon className="w-6 h-6" />
      </button>
      <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-border z-50">
        {label}
      </span>
    </div>
  );
}

function KpiSlider({ label, value, color }: { label: string, value: number, color?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-foreground">{label}</span>
        <span className="text-xs font-mono font-bold text-primary">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000 ease-out", color || "bg-primary")} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
