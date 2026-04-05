import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { LayoutDashboard, Type, Wrench, FolderOpen, MessageSquare, LogOut, Loader2, Sparkles, Settings } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/hero", label: "Hero", icon: Type },
  { href: "/skills", label: "Skills", icon: Wrench },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/ai", label: "AI Assistant", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth-user"],
    queryFn: () => apiRequest("/auth/user"),
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
      // Use window.location to navigate to home page (outside wouter's nested context)
      window.location.href = "/";
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col flex-shrink-0">
        <div className="p-6">
          <Link href="/">
            <button className="flex items-center gap-2 mb-1 hover:opacity-80 transition-opacity">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-lg gradient-text">Dashboard</h2>
            </button>
          </Link>
          <p className="text-xs text-muted-foreground">Manage your portfolio</p>
        </div>
        <Separator />
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href === "/hero" && (location === "/" || location === ""));
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
