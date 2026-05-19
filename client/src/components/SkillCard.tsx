import { motion } from "framer-motion";
import type { Skill } from "@shared/schema";
import * as Icons from "lucide-react";

interface SkillCardProps {
  skill: Skill;
  index?: number;
}

export default function SkillCard({ skill, index = 0 }: SkillCardProps) {
  const IconComponent = (Icons as any)[skill.icon] || Icons.Star;
  const categoryColors: Record<string, string> = {
    design: "bg-primary/[0.08] border-primary/20",
    photo: "bg-secondary/[0.08] border-secondary/20",
    "3d": "bg-accent/[0.08] border-accent/20",
  };
  const iconColors: Record<string, string> = {
    design: "text-primary",
    photo: "text-secondary",
    "3d": "text-accent",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.2, 0.9, 0.2, 1] }}
      whileHover={{ y: -10, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
      className={`service-card magnetic-card glass-card glass-card-hover relative overflow-hidden rounded-2xl p-5 transition-all duration-500 cursor-default ${categoryColors[skill.category] || ""}`}
    >
      <div className="relative z-10 flex items-center gap-3 mb-4">
        <motion.div
          className={`p-2.5 rounded-xl floating-glass ${iconColors[skill.category] || "text-primary"}`}
          whileHover={{ rotate: 8, scale: 1.08 }}
        >
          <IconComponent className="w-5 h-5" />
        </motion.div>
        <div>
          <h4 className="font-heading font-black text-sm leading-tight">{skill.name}</h4>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono">
            {skill.category}
          </span>
        </div>
      </div>
      <div className="relative z-10 w-full bg-white/10 border border-white/15 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.proficiency}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 + index * 0.05 }}
          viewport={{ once: true }}
          className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
        />
      </div>
      <span className="relative z-10 text-[11px] text-muted-foreground mt-1.5 block text-right font-mono">
        {skill.proficiency}%
      </span>
      <div className="hover-reveal absolute inset-x-0 bottom-0 z-20 bg-background/82 px-5 py-3 text-foreground backdrop-blur-xl">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{skill.category}</span>
      </div>
    </motion.div>
  );
}
