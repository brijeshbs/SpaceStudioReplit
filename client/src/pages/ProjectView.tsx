import { useParams, Link } from "wouter";
import { useProject } from "@/hooks/use-projects";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { Loader2, ArrowLeft, Image as ImageIcon, Ruler, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useCreateFloorplan, useFloorplans } from "@/hooks/use-floorplans";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { api } from "@shared/routes";

export default function ProjectView() {
  const { id } = useParams();
  const projectId = Number(id);
  const { data: project, isLoading } = useProject(projectId);
  const { data: floorplans, isLoading: isLoadingPlans } = useFloorplans(projectId);
  const { mutate: uploadFloorplan, isPending: isUploading } = useCreateFloorplan();
  const { toast } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      uploadFloorplan({
        projectId,
        name: file.name.split('.')[0],
        originalFilename: file.name,
        imageUrl: imageUrl, 
        scale: 1.0,
        features: { walls: [], columns: [], windows: [], core: [] }
      }, {
        onSuccess: () => {
          setUploadOpen(false);
          queryClient.invalidateQueries({ queryKey: [api.floorplans.list.path, projectId] });
          toast({ title: "Success", description: "Floorplan uploaded successfully" });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to upload floorplan", variant: "destructive" });
        }
      });
    };
    reader.readAsDataURL(file);
  };

  if (isLoading || isLoadingPlans) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!project) return <div className="p-8">Project not found</div>;

  return (
    <div className="flex bg-background min-h-screen">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">{project.name}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground">{project.companyType}</span>
                <span>•</span>
                <span>{project.headcount} Employees</span>
              </div>
            </div>

            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button>Upload Floorplan</Button>
              </DialogTrigger>
              <DialogContent>
                <h2 className="text-xl font-bold mb-4">Upload Floorplan</h2>
                <FileUpload onFileSelect={handleFileUpload} isUploading={isUploading} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6">
          <h2 className="text-xl font-semibold">Floorplans</h2>
          
          {floorplans && floorplans.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {floorplans.map((floorplan: any) => (
                 <Link key={floorplan.id} href={`/editor/${floorplan.id}`}>
                   <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                     <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                       <img 
                         src={floorplan.imageUrl} 
                         alt={floorplan.name} 
                         className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                       />
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                     </div>
                     <div className="p-4">
                       <div className="flex justify-between items-center mb-1">
                         <h3 className="font-semibold">{floorplan.name}</h3>
                         <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                       </div>
                       <p className="text-xs text-muted-foreground flex items-center gap-2">
                         <Ruler className="w-3 h-3" />
                         Original: {floorplan.originalFilename}
                       </p>
                     </div>
                   </div>
                 </Link>
               ))}
             </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center bg-muted/20">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No floorplans uploaded</h3>
              <p className="text-muted-foreground mb-6">Upload a floorplan to start designing your office space.</p>
              <Button onClick={() => setUploadOpen(true)}>Upload Now</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
