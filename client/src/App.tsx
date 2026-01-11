import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthWrapper } from "@/components/auth-wrapper";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import ProjectView from "@/pages/ProjectView";
import Editor from "@/pages/Editor";
import Login from "@/pages/Login";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      
      {/* Protected Routes (wrapped in AuthWrapper check) */}
      <Route path="/dashboard">
        <AuthWrapper><Dashboard /></AuthWrapper>
      </Route>
      <Route path="/projects/:id">
        <AuthWrapper><ProjectView /></AuthWrapper>
      </Route>
      <Route path="/editor/:id">
        <AuthWrapper><Editor /></AuthWrapper>
      </Route>

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
