import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { useProjects } from "@/hooks/use-projects";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Link } from "wouter";
import { Calendar, Users, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="flex bg-background min-h-screen">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome back, {user?.displayName?.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground mt-2">Manage your office planning projects</p>
          </div>
          <CreateProjectDialog />
        </header>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : projects?.length === 0 ? (
          <div className="bg-muted/30 rounded-2xl border-2 border-dashed border-border p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">Start by creating your first project to upload floorplans and generate layouts.</p>
            <CreateProjectDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-card group rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
            {project.companyType}
          </span>
        </div>
        
        <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
          {project.description || "No description provided."}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {project.headcount}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(project.createdAt), 'MMM d, yyyy')}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
      </div>
    </Link>
  );
}
