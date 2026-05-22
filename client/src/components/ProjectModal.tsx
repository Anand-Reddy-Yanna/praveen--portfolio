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
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/82 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.36, ease: [0.2, 0.9, 0.2, 1] }}
          className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/60 backdrop-blur-xl hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Full image */}
          <img
            src={project.imageUrl}
            alt="Project"
            className="w-full h-auto max-h-[90vh] object-contain bg-background"
            style={{ objectPosition: project.imagePosition }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
