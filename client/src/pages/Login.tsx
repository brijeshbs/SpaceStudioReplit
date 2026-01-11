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
              Sign In with Replit (Demo)
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
