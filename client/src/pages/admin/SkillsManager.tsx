import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import type { Skill } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// ── Skill logo URL helper ──
const SKILL_LOGO_MAP: Record<string, string> = {
  'adobe photoshop': 'adobephotoshop',
  'adobe illustrator': 'adobeillustrator',
  'adobe xd': 'adobexd',
  'adobe premiere pro': 'adobepremierepro',
  'adobe after effects': 'adobeaftereffects',
  'adobe lightroom': 'adobelightroom',
  'adobe indesign': 'adobeindesign',
  'figma': 'figma',
  'sketch': 'sketch',
  'canva': 'canva',
  'blender': 'blender',
  'cinema 4d': 'cinema4d',
  'zbrush': 'zbrush',
  'after effects': 'adobeaftereffects',
  'lightroom': 'adobelightroom',
  'premiere pro': 'adobepremierepro',
  'photoshop': 'adobephotoshop',
  'illustrator': 'adobeillustrator',
  'davinci resolve': 'davinciresolve',
  'coreldraw': 'coreldraw',
  'inkscape': 'inkscape',
  'gimp': 'gimp',
  'procreate': 'procreate',
  'substance painter': 'substance3d',
  'affinity designer': 'affinitydesigner',
  'affinity photo': 'affinityphoto',
  'invision': 'invision',
  'framer': 'framer',
  'webflow': 'webflow',
  'wordpress': 'wordpress',
  'indesign': 'adobeindesign',
  'substance designer': 'substance3d',
};

// Only graphic designer skills
const PRESET_SKILLS = [
  "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign",
  "Adobe XD", "Adobe After Effects", "Adobe Premiere Pro",
  "Adobe Lightroom", "Figma", "Sketch", "Canva",
  "CorelDraw", "GIMP", "Inkscape", "Procreate",
  "Affinity Designer", "Affinity Photo",
  "Blender", "Cinema 4D", "ZBrush", "Substance Painter",
  "DaVinci Resolve", "Framer", "Webflow", "InVision",
];

function getSkillLogoUrl(skillName: string): string {
  const slug = SKILL_LOGO_MAP[skillName.toLowerCase()];
  if (slug) return `https://cdn.simpleicons.org/${slug}/white`;
  return `https://cdn.simpleicons.org/${skillName.toLowerCase().replace(/[\s.+#]/g, '')}/white`;
}

export default function SkillsManager() {
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [logoError, setLogoError] = useState<Set<string>>(new Set());

  const { data: skills, isLoading } = useQuery<Skill[]>({
    queryKey: ["skills"],
    queryFn: () => apiRequest("/api/skills"),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("/api/skills", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast({ title: "Skill added", variant: "success" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/skills/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      await queryClient.refetchQueries({ queryKey: ["skills"] });
      toast({ title: "Skill removed", variant: "success" });
    },
  });

  const activeSkillNames = new Set(skills?.map(s => s.name.toLowerCase()) || []);

  function toggleSkill(name: string) {
    if (activeSkillNames.has(name.toLowerCase())) {
      const skill = skills?.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (skill) deleteMut.mutate(skill.id);
    } else {
      createMut.mutate({
        name,
        category: "design",
        proficiency: 100,
        icon: "Star",
      });
    }
  }

  function addCustomSkill() {
    if (!customName.trim()) return;
    if (activeSkillNames.has(customName.trim().toLowerCase())) {
      toast({ title: "Skill already exists", variant: "destructive" });
      return;
    }
    createMut.mutate({
      name: customName.trim(),
      category: "design",
      proficiency: 100,
      icon: "Star",
    });
    setCustomName("");
    setAddDialogOpen(false);
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const presetLower = new Set(PRESET_SKILLS.map(s => s.toLowerCase()));
  const customSkills = skills?.filter(s => !presetLower.has(s.name.toLowerCase())) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold gradient-text">Skills</h1>
          <p className="text-sm text-muted-foreground mt-1">Tick the skills you know. Add custom ones below.</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Custom Skill
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {PRESET_SKILLS.map((name) => {
          const isActive = activeSkillNames.has(name.toLowerCase());
          const hasLogoError = logoError.has(name.toLowerCase());
          return (
            <button
              key={name}
              onClick={() => toggleSkill(name)}
              className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left group ${
                isActive
                  ? "bg-primary/15 border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                  : "bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06]"
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                isActive ? "bg-primary border-primary" : "border-white/30 group-hover:border-white/50"
              }`}>
                {isActive && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {!hasLogoError ? (
                <img
                  src={getSkillLogoUrl(name)}
                  alt={name}
                  className="w-6 h-6 flex-shrink-0 opacity-80"
                  onError={() => setLogoError(prev => new Set(prev).add(name.toLowerCase()))}
                />
              ) : (
                <div className="w-6 h-6 flex-shrink-0 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  {name.charAt(0)}
                </div>
              )}
              <span className={`text-xs font-medium truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {name}
              </span>
            </button>
          );
        })}

        {customSkills.map((skill) => {
          const hasLogoError2 = logoError.has(skill.name.toLowerCase());
          return (
            <button
              key={`custom-${skill.id}`}
              onClick={() => toggleSkill(skill.name)}
              className="relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left group bg-primary/15 border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
            >
              <div className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center bg-primary border-primary">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {!hasLogoError2 ? (
                <img
                  src={getSkillLogoUrl(skill.name)}
                  alt={skill.name}
                  className="w-6 h-6 flex-shrink-0 opacity-80"
                  onError={() => setLogoError(prev => new Set(prev).add(skill.name.toLowerCase()))}
                />
              ) : (
                <div className="w-6 h-6 flex-shrink-0 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  {skill.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-medium truncate text-foreground">{skill.name}</span>
              <span className="absolute top-1 right-1 text-[8px] text-primary/60 font-mono">CUSTOM</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-4 glass-card rounded-xl">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{skills?.length || 0}</span> skills selected
        </p>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Custom Skill</DialogTitle>
            <DialogDescription>Enter the skill name — the logo will be fetched automatically.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Skill Name</Label>
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Houdini, Rhino, Mari..."
                className="mt-1.5"
                onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
              />
            </div>
            {customName.trim() && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                <img
                  src={getSkillLogoUrl(customName.trim())}
                  alt="Preview"
                  className="w-8 h-8"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <span className="text-sm font-medium">{customName.trim()}</span>
              </div>
            )}
            <Button onClick={addCustomSkill} className="w-full" disabled={!customName.trim() || createMut.isPending}>
              {createMut.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Add Skill
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
