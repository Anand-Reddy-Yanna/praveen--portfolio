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
    design: "from-primary/20 to-primary/5 border-primary/20",
    photo: "from-secondary/20 to-secondary/5 border-secondary/20",
    "3d": "from-accent/20 to-accent/5 border-accent/20",
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
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={`glass-card glass-card-hover p-5 transition-all duration-300 cursor-default bg-gradient-to-br ${categoryColors[skill.category] || ""}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg bg-white/5 ${iconColors[skill.category] || "text-primary"}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-heading font-semibold text-sm leading-tight">{skill.name}</h4>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono">
            {skill.category}
          </span>
        </div>
      </div>
      <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.proficiency}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 + index * 0.05 }}
          viewport={{ once: true }}
          className="h-full rounded-full bg-gradient-to-r from-primary/60 via-accent/50 to-secondary/40"
        />
      </div>
      <span className="text-[11px] text-muted-foreground mt-1.5 block text-right font-mono">
        {skill.proficiency}%
      </span>
    </motion.div>
  );
}
