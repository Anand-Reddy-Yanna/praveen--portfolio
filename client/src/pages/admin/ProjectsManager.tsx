import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import type { Project } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function ProjectsManager() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => apiRequest("/api/projects"),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("/api/projects", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); toast({ title: "Image uploaded", variant: "success" }); closeDialog(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); toast({ title: "Image deleted", variant: "success" }); },
  });

  function closeDialog() { setDialogOpen(false); setImageUrl(""); }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) return;
    createMut.mutate({
      imageUrl,
      title: "Project",
      category: "design",
      description: "Project image",
      imagePosition: "center",
      isFeatured: true,
    });
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold gradient-text">Projects</h1>
        <Button onClick={() => { setImageUrl(""); setDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Upload Image
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project) => (
          <Card key={project.id} className="glass-card overflow-hidden group relative">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={project.imageUrl} alt="Project" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: project.imagePosition }} />
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-end">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMut.mutate(project.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>Upload a project image</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                dragOver
                  ? "border-primary bg-primary/10"
                  : imageUrl
                    ? "border-primary/50 bg-primary/5"
                    : "border-white/20 hover:border-white/40 hover:bg-white/5"
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {imageUrl ? (
                <div className="space-y-3">
                  <img src={imageUrl} alt="Preview" className="w-full max-h-60 object-contain rounded-lg" />
                  <p className="text-xs text-muted-foreground">Click or drop to replace</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={!imageUrl || createMut.isPending}>
              {createMut.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Upload Image
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
