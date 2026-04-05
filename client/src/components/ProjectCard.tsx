import { motion } from "framer-motion";
import type { Project } from "@shared/schema";
import { ArrowUpRight } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-xl border border-border/80 bg-card cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
      onClick={onClick}
    >
      {/* Image — full aspect ratio, no cropping */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ objectPosition: project.imagePosition || "center" }}
          loading="lazy"
        />
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 rounded-full bg-white/10 backdrop-blur-sm">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
        </div>
        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest rounded-md bg-black/60 text-white backdrop-blur-sm border border-white/10">
          {project.category}
        </span>
      </div>

      {/* Text content below the image */}
      <div className="p-5">
        <h3 className="text-base font-heading font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {project.description}
        </p>
      </div>
    </motion.div>
  );
}
