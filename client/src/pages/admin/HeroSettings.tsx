import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import type { HeroSettings } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HeroSettings() {
  const { toast } = useToast();
  const { data: hero, isLoading } = useQuery<HeroSettings>({
    queryKey: ["hero"],
    queryFn: () => apiRequest("/api/hero"),
  });

  const { register, handleSubmit, reset } = useForm<Partial<HeroSettings>>();

  const mutation = useMutation({
    mutationFn: (data: Partial<HeroSettings>) =>
      apiRequest("/api/hero", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero"] });
      toast({ title: "Saved!", description: "Hero settings updated.", variant: "success" });
    },
    onError: () => toast({ title: "Error", description: "Failed to save.", variant: "destructive" }),
  });

  if (isLoading || !hero) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-heading font-bold gradient-text mb-8">Hero Settings</h1>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Edit Homepage Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input defaultValue={hero.name} {...register("name")} className="mt-1.5" />
              </div>
              <div>
                <Label>Role</Label>
                <Input defaultValue={hero.role} {...register("role")} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Tagline</Label>
              <Textarea defaultValue={hero.tagline} {...register("tagline")} rows={3} className="mt-1.5" />
            </div>
            <div>
              <Label>About Text</Label>
              <Textarea defaultValue={hero.aboutText} {...register("aboutText")} rows={4} className="mt-1.5" />
            </div>
            <div>
              <Label>Projects Text</Label>
              <Input defaultValue={hero.projectsText} {...register("projectsText")} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Contact Email</Label>
                <Input defaultValue={hero.contactEmail} {...register("contactEmail")} className="mt-1.5" />
              </div>
              <div>
                <Label>Footer Text</Label>
                <Input defaultValue={hero.footerText} {...register("footerText")} className="mt-1.5" />
              </div>
            </div>
            <Button type="submit" className="gap-2" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
