import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layout, Zap, PieChart, Layers } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Layout className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">SpaceStudio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
          AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Office Planning</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload a floorplan and let our AI generate optimized office layouts in seconds. 
          Maximize efficiency, comfort, and productivity instantly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-lg shadow-xl shadow-primary/20">
              Start Designing Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
            Watch Demo
          </Button>
        </div>

        {/* Hero Image / Abstract Representation */}
        <div className="mt-20 relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-muted aspect-video max-w-5xl mx-auto group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          {/* Unsplash Architecture Image */}
          {/* modern office interior architecture clean minimalistic */}
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2301"
            alt="Modern Office" 
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background/90 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-2xl max-w-sm text-left transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">AI PROCESSING COMPLETE</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Space Efficiency</span>
                  <span className="font-bold text-primary">94%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[94%]" />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cost Saving</span>
                  <span className="font-bold text-primary">18%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[18%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Layers}
              title="Smart Zoning"
              description="Automatically detect walls, windows, and core elements. Define zones based on team adjacencies."
            />
            <FeatureCard 
              icon={Zap}
              title="Instant Generation"
              description="Generate hundreds of layout variations in seconds based on your headcount and work style."
            />
            <FeatureCard 
              icon={PieChart}
              title="Data-Driven Decisions"
              description="Compare layouts with real-time metrics on density, cost, and environmental impact."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-display text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
