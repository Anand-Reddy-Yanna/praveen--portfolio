import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Upload, Edit2, FolderPlus, X, Check } from "lucide-react";
import type { Project, ProjectSection } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function ProjectsManager() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Section management state
  const [newSectionName, setNewSectionName] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState("");

  const { data: projects, isLoading: pLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => apiRequest("/api/projects"),
  });

  const { data: sections, isLoading: sLoading } = useQuery<ProjectSection[]>({
    queryKey: ["project-sections"],
    queryFn: () => apiRequest("/api/project-sections"),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("/api/projects", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); toast({ title: "Project added", variant: "success" }); closeDialog(); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); toast({ title: "Project updated", variant: "success" }); closeDialog(); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); toast({ title: "Project deleted", variant: "success" }); },
  });

  const createSectionMut = useMutation({
    mutationFn: (data: { name: string }) => apiRequest("/api/project-sections", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["project-sections"] }); toast({ title: "Section added" }); setNewSectionName(""); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateSectionMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => apiRequest(`/api/project-sections/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["project-sections", "projects"] }); toast({ title: "Section renamed" }); setEditingSectionId(null); },
  });

  const deleteSectionMut = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/project-sections/${id}`, { method: "DELETE" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["project-sections", "projects"] }); toast({ title: "Section deleted" }); },
  });

  function closeDialog() { setDialogOpen(false); setImageUrl(""); setEditingProject(null); setSelectedSection(""); }

  function openAddDialog() {
    setEditingProject(null);
    setImageUrl("");
    setSelectedSection(sections?.[0]?.name || "");
    setDialogOpen(true);
  }

  function openEditDialog(project: Project) {
    setEditingProject(project);
    setImageUrl(project.imageUrl);
    setSelectedSection(project.section);
    setDialogOpen(true);
  }

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
    if (!imageUrl || !selectedSection) return;
    const payload = {
      imageUrl,
      title: "Project",
      section: selectedSection,
      description: "Project image",
      imagePosition: "center" as const,
      isFeatured: true,
    };
    if (editingProject) {
      updateMut.mutate({ id: String(editingProject.id), data: payload });
    } else {
      createMut.mutate(payload);
    }
  }

  const isLoading = pLoading || sLoading;
  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  // Group projects by section
  const projectsBySection: Record<string, Project[]> = {};
  sections?.forEach(s => { projectsBySection[s.name] = []; });
  projects?.forEach(p => {
    if (!projectsBySection[p.section]) projectsBySection[p.section] = [];
    projectsBySection[p.section].push(p);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold gradient-text">Projects</h1>
        <Button onClick={openAddDialog} className="gap-2" disabled={!sections || sections.length === 0}>
          <Plus className="w-4 h-4" /> Upload Image
        </Button>
      </div>

      {/* Section Management */}
      <Card className="glass-card mb-8">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <FolderPlus className="w-4 h-4" /> Manage Sections
          </h3>

          {/* Existing sections */}
          <div className="flex flex-wrap gap-2 mb-4">
            {sections?.map((section) => (
              <div key={section.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] text-sm">
                {editingSectionId === String(section.id) ? (
                  <>
                    <input
                      value={editingSectionName}
                      onChange={(e) => setEditingSectionName(e.target.value)}
                      className="bg-transparent border-b border-primary/50 outline-none w-24 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => updateSectionMut.mutate({ id: String(section.id), name: editingSectionName })}
                      className="p-0.5 text-green-400 hover:text-green-300"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => setEditingSectionId(null)} className="p-0.5 text-muted-foreground hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <span>{section.name}</span>
                    <span className="text-xs text-muted-foreground ml-1">({projectsBySection[section.name]?.length || 0})</span>
                    <button
                      onClick={() => { setEditingSectionId(String(section.id)); setEditingSectionName(section.name); }}
                      className="p-0.5 text-muted-foreground hover:text-foreground ml-1"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${section.name}" and all its projects?`)) deleteSectionMut.mutate(section.id); }}
                      className="p-0.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add new section */}
          <form
            onSubmit={(e) => { e.preventDefault(); if (newSectionName.trim()) createSectionMut.mutate({ name: newSectionName.trim() }); }}
            className="flex gap-2"
          >
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="New section name (e.g. UI/UX Design)"
              className="flex-1"
            />
            <Button type="submit" variant="outline" className="gap-2" disabled={!newSectionName.trim() || createSectionMut.isPending}>
              {createSectionMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Section
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Projects grouped by section */}
      {sections?.map((section) => {
        const sectionProjects = projectsBySection[section.name] || [];
        return (
          <div key={section.id} className="mb-8">
            <h2 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary/60" />
              {section.name}
              <span className="text-xs text-muted-foreground font-normal">({sectionProjects.length})</span>
            </h2>
            {sectionProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 mb-4 pl-5">No projects in this section yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {sectionProjects.map((project) => (
                  <Card key={project.id} className="glass-card overflow-hidden group relative">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img src={project.imageUrl} alt="Project" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: project.imagePosition }} />
                    </div>
                    <CardContent className="p-2 flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEditDialog(project)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMut.mutate(project.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Upload / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Upload Image"}</DialogTitle>
            <DialogDescription>{editingProject ? "Update the project image or section" : "Upload a project image to a section"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Section selector */}
            <div>
              <Label className="mb-1.5 block">Section</Label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select a section</option>
                {sections?.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Image upload */}
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
            <Button type="submit" className="w-full" disabled={!imageUrl || !selectedSection || createMut.isPending || updateMut.isPending}>
              {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingProject ? "Update Project" : "Upload Image"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
