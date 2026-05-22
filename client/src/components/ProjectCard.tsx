import { motion } from "framer-motion";
import type { Project } from "@shared/schema";

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
      {/* Image — full aspect ratio */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <motion.img
          src={project.imageUrl}
          alt="Project"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          style={{ objectPosition: project.imagePosition || "center" }}
          loading="lazy"
        />
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
      </div>
    </motion.div>
  );
}
