import type { Project } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-card border border-border/80 rounded-xl overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-card/95 backdrop-blur border-b border-border/50">
            <div className="flex items-center gap-3">
              <span className="inline-block px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest rounded-md bg-primary/20 text-primary border border-primary/10">
                {project.category}
              </span>
              <h2 className="text-lg font-heading font-bold gradient-text">
                {project.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Full image — no max-height crop */}
            {project.videoUrl ? (
              <video
                src={project.videoUrl}
                controls
                className="w-full rounded-xl mb-6"
              />
            ) : (
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full rounded-xl mb-6 object-contain bg-black/20"
                style={{ objectPosition: project.imagePosition }}
              />
            )}

            {/* Description */}
            <div>
              <h3 className="text-base font-heading font-semibold mb-3 text-foreground">
                Project Overview
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {project.description}
              </p>
              {project.content && (
                <div className="mt-6 p-5 rounded-xl bg-white/[0.02] border border-border/50 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {project.content}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
