import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import ProjectView from "@/pages/ProjectView";
import Editor from "@/pages/Editor";
import Login from "@/pages/Login";

function Router() {
  return (
    <Switch>
      {/* Bypass authentication - everything is public for demo */}
      <Route path="/" component={Dashboard} />
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/projects/:id" component={ProjectView} />
      <Route path="/editor/:id" component={Editor} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
