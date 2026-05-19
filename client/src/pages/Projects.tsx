import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/ProjectCard";
import ProjectModal from "@/components/ProjectModal";
import CursorGlow from "@/components/CursorGlow";

export default function Projects() {
  const [filter, setFilter] = useState<string>("all");
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

  const categories = ["all", ...Array.from(new Set(projects.map((p) => p.category)))];
  const filtered = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <div className="animated-bg" />
      <CursorGlow />

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-card/[0.82] backdrop-blur-xl">
        <div className="section-container py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </Link>
            <h1 className="text-xl font-heading font-black text-foreground">All Projects</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-300 capitalize border ${
                  filter === cat
                    ? "bg-primary text-primary-foreground border-white/25 shadow-[0_14px_40px_hsl(var(--primary)/0.24)]"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="section-container py-10">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 34, scale: 0.96, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.52, delay: i * 0.04, ease: [0.2, 0.9, 0.2, 1] }}
            >
              <ProjectCard project={project} onClick={() => setSelectedProject(project)} />
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No projects found in this category.
          </div>
        )}
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
