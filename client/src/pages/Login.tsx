import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Check if already logged in
  useQuery({
    queryKey: ["auth-user"],
    queryFn: () => apiRequest("/auth/user"),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: () =>
      apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    onSuccess: () => navigate("/admin"),
    onError: (err: Error) => setError(err.message || "Invalid credentials"),
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, hsl(270 100% 60% / 0.08) 0%, hsl(240 10% 4%) 70%)",
        }}
      />
      <div className="relative glass-card p-8 w-full max-w-md">
        <h1 className="text-3xl font-heading font-bold gradient-text mb-2 text-center">
          Admin Login
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Sign in to manage your portfolio
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            loginMutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium mb-2 block">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
