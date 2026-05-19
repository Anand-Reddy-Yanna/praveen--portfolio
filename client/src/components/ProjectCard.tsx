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
      whileHover={{ y: -10, rotateX: 2, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="project-card magnetic-card glass-card group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:border-white/30 hover:shadow-[0_30px_90px_hsl(var(--primary)/0.18)]"
      onClick={onClick}
    >
      {/* Image — full aspect ratio, no cropping */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <motion.img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          style={{ objectPosition: project.imagePosition || "center" }}
          loading="lazy"
        />
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 p-3 rounded-full floating-glass text-primary-foreground">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
        </div>
        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest rounded-full border border-white/25 bg-background/40 text-foreground backdrop-blur-xl">
          {project.category}
        </span>
      </div>

      {/* Text content below the image */}
      <div className="p-5">
        <h3 className="text-lg font-heading font-black text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {project.description}
        </p>
      </div>
      <div className="hover-reveal absolute inset-x-0 bottom-0 bg-background/82 p-5 text-foreground backdrop-blur-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Open case study</p>
        <p className="mt-1 text-sm font-semibold">View project details</p>
      </div>
    </motion.div>
  );
}
