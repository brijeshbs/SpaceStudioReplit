import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Layout className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold">SpaceStudio</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your projects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input placeholder="name@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" />
            </div>
            
            {/* 
              In a real app, this would submit a form. 
              Since we are using Replit Auth (mocked via use-auth), we redirect to the auth endpoint.
            */}
            <Button className="w-full" onClick={() => window.location.href = "/api/login"}>
              Continue with Replit
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo Credentials</span>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
              <p><strong>Email:</strong> demo@spacestudio.ai</p>
              <p><strong>Password:</strong> spacestudio2026</p>
              <p className="text-xs text-muted-foreground mt-2 italic">Note: Use the "Continue with Replit" button above to access the demo account instantly.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
