import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Lock, Eye, EyeOff, Plus, Trash2, Link2, Github, Instagram, Twitter, Linkedin, Youtube, Globe, Facebook, ExternalLink } from "lucide-react";
import type { SocialLink } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PLATFORM_OPTIONS = [
  { value: "github", label: "GitHub", icon: Github },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "twitter", label: "Twitter / X", icon: Twitter },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "dribbble", label: "Dribbble", icon: Globe },
  { value: "behance", label: "Behance", icon: Globe },
  { value: "website", label: "Website", icon: Globe },
];

function getPlatformIcon(platform: string) {
  const found = PLATFORM_OPTIONS.find(p => p.value === platform.toLowerCase());
  return found?.icon || Globe;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Social link form state
  const [newPlatform, setNewPlatform] = useState("github");
  const [newUrl, setNewUrl] = useState("");

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: () => apiRequest("/auth/user"),
  });

  const { data: socialLinks, isLoading: linksLoading } = useQuery<SocialLink[]>({
    queryKey: ["social-links"],
    queryFn: () => apiRequest("/api/social-links"),
  });

  const changePwMut = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiRequest("/api/change-password", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Password changed!", description: "Your password has been updated.", variant: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message || "Failed to change password", variant: "destructive" });
    },
  });

  const createLinkMut = useMutation({
    mutationFn: (data: { platform: string; url: string }) =>
      apiRequest("/api/social-links", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      toast({ title: "Social link added!" });
      setNewUrl("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteLinkMut = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/social-links/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      toast({ title: "Social link removed" });
    },
  });

  function handlePwSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    changePwMut.mutate({ currentPassword, newPassword });
  }

  function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl.trim()) return;
    createLinkMut.mutate({ platform: newPlatform, url: newUrl.trim() });
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-heading font-bold gradient-text mb-8">Settings</h1>

      {/* Social Links Management */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" /> Social Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Existing links */}
          {linksLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : socialLinks && socialLinks.length > 0 ? (
            <div className="space-y-3 mb-6">
              {socialLinks.map((link) => {
                const Icon = getPlatformIcon(link.platform);
                return (
                  <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{link.platform}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => deleteLinkMut.mutate(link.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">No social links added yet.</p>
          )}

          {/* Add new link form */}
          <form onSubmit={handleAddLink} className="flex flex-col sm:flex-row gap-3">
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="flex-1"
              type="url"
              required
            />
            <Button type="submit" className="gap-2" disabled={createLinkMut.isPending}>
              {createLinkMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-muted-foreground">Username:</span>
            <span className="text-sm font-medium">{user?.username || "admin"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePwSubmit} className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>New Password</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-1.5"
                required
              />
            </div>
            <Button type="submit" className="gap-2" disabled={changePwMut.isPending}>
              {changePwMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
