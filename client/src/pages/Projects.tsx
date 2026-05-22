import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import ProjectCarousel from "@/components/ProjectCarousel";
import ProjectModal from "@/components/ProjectModal";
import CursorGlow from "@/components/CursorGlow";

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => apiRequest("/api/projects"),
  });

  if (isLoading || !projects) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="animated-bg" />
      <CursorGlow />

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-card/[0.82] backdrop-blur-xl">
        <div className="section-container py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <h1 className="text-xl font-heading font-black text-foreground">All Projects</h1>
        </div>
      </div>

      {/* Carousel */}
      <div className="flex items-center min-h-[calc(100vh-65px)]">
        <div className="w-full">
          <ProjectCarousel projects={projects} onSelect={setSelectedProject} />
        </div>
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
