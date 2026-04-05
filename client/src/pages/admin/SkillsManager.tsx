import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import type { Skill } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ICONS = ["Palette","PenTool","Layout","Film","Camera","Sun","Sparkles","Layers","Box","Boxes","Gem","Paintbrush","Monitor","Code","Star","Zap","Eye","Figma","Image","Wand2"];

export default function SkillsManager() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState({ name: "", category: "design" as "design" | "photo" | "3d", proficiency: 80, icon: "Star" });

  const { data: skills, isLoading } = useQuery<Skill[]>({
    queryKey: ["skills"],
    queryFn: () => apiRequest("/api/skills"),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("/api/skills", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["skills"] }); toast({ title: "Skill created", variant: "success" }); closeDialog(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/skills/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["skills"] }); toast({ title: "Skill updated", variant: "success" }); closeDialog(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/skills/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      await queryClient.refetchQueries({ queryKey: ["skills"] });
      toast({ title: "Skill deleted", variant: "success" });
    },
  });

  function closeDialog() { setDialogOpen(false); setEditing(null); setForm({ name: "", category: "design", proficiency: 80, icon: "Star" }); }

  function openEdit(skill: Skill) {
    setEditing(skill);
    setForm({ name: skill.name, category: skill.category, proficiency: skill.proficiency, icon: skill.icon });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateMut.mutate({ id: editing.id, ...form });
    } else {
      createMut.mutate(form);
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold gradient-text">Skills</h1>
        <Button onClick={() => { setEditing(null); setForm({ name: "", category: "design", proficiency: 80, icon: "Star" }); setDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Skill
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills?.map((skill) => (
          <Card key={skill.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <h3 className="font-heading font-semibold">{skill.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(skill)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMut.mutate(skill.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span className="capitalize">{skill.category}</span>
                <span>•</span>
                <span>{skill.icon}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="h-full rounded-full bg-gradient-to-r from-primary/60 to-accent/40" style={{ width: `${skill.proficiency}%` }} />
              </div>
              <span className="text-xs text-muted-foreground">{skill.proficiency}%</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Skill" : "Add Skill"}</DialogTitle>
            <DialogDescription>{editing ? "Update skill details" : "Add a new skill to your portfolio"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" required />
            </div>
            <div>
              <Label>Category</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="design">Design</option>
                <option value="photo">Photo</option>
                <option value="3d">3D</option>
              </select>
            </div>
            <div>
              <Label>Proficiency: {form.proficiency}%</Label>
              <input
                type="range" min="0" max="100" value={form.proficiency}
                onChange={(e) => setForm({ ...form, proficiency: Number(e.target.value) })}
                className="mt-1.5 w-full accent-primary"
              />
            </div>
            <div>
              <Label>Icon</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button key={icon} type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`px-2 py-1 text-xs rounded border ${form.icon === icon ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  >{icon}</button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={createMut.isPending || updateMut.isPending}>
              {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editing ? "Update" : "Create"} Skill
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
