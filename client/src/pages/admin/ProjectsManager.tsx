import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Pencil, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import type { Project } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const defaultForm = { title: "", category: "design" as const, imageUrl: "", imagePosition: "center" as const, videoUrl: "", description: "", content: "", isFeatured: false };

export default function ProjectsManager() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(defaultForm);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => apiRequest("/api/projects"),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("/api/projects", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); toast({ title: "Project created", variant: "success" }); closeDialog(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); toast({ title: "Project updated", variant: "success" }); closeDialog(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); toast({ title: "Project deleted", variant: "success" }); },
  });

  function closeDialog() { setDialogOpen(false); setEditing(null); setForm(defaultForm); }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({ title: p.title, category: p.category, imageUrl: p.imageUrl, imagePosition: p.imagePosition, videoUrl: p.videoUrl || "", description: p.description, content: p.content || "", isFeatured: p.isFeatured });
    setDialogOpen(true);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string });
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, videoUrl: form.videoUrl || null, content: form.content || null };
    if (editing) updateMut.mutate({ id: editing.id, ...data });
    else createMut.mutate(data);
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold gradient-text">Projects</h1>
        <Button onClick={() => { setEditing(null); setForm(defaultForm); setDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project) => (
          <Card key={project.id} className="glass-card overflow-hidden">
            <div className="h-40 overflow-hidden">
              <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" style={{ objectPosition: project.imagePosition }} />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <h3 className="font-heading font-semibold text-sm">{project.title}</h3>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(project)}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMut.mutate(project.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="capitalize">{project.category}</span>
                {project.isFeatured && <span className="text-primary">★ Featured</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Project" : "Add Project"}</DialogTitle>
            <DialogDescription>{editing ? "Update project details" : "Add a new project"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" required />
            </div>
            <div>
              <Label>Category</Label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="design">Design</option>
                <option value="photo">Photo</option>
                <option value="3d">3D</option>
              </select>
            </div>
            <div>
              <Label>Image</Label>
              <div className="mt-1.5 space-y-2">
                <Input value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="Image URL or upload below" />
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
                  <ImageIcon className="w-4 h-4" /> Upload Image
                </Button>
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-md border border-border" style={{ objectPosition: form.imagePosition }} />
                )}
              </div>
            </div>
            <div>
              <Label>Image Position</Label>
              <select value={form.imagePosition} onChange={(e) => setForm({ ...form, imagePosition: e.target.value as any })} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <Label>Video URL (optional)</Label>
              <Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="mt-1.5" placeholder="https://..." />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1.5" required />
            </div>
            <div>
              <Label>Content (optional)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} className="mt-1.5" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
              <Label>Featured on homepage</Label>
            </div>
            <Button type="submit" className="w-full" disabled={createMut.isPending || updateMut.isPending}>
              {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editing ? "Update" : "Create"} Project
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
