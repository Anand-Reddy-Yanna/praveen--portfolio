import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { Skill } from "@shared/schema";
import {
  Palette, PenTool, Layout, Film, Camera, Sun, Sparkles, Layers,
  Box, Gem, Paintbrush, Monitor, Image, Wand2, Type, Scissors,
  Aperture, Blend, Brush, Crop, Droplet, Edit3, Feather, Grid,
  Hexagon, Maximize, Move, PaintBucket, Pen, Star, Triangle, Zap,
} from "lucide-react";

/* ─── Icon mapping for design tools ─── */
const SKILL_ICONS: Record<string, any> = {
  "adobe photoshop": Image,
  "adobe illustrator": PenTool,
  "adobe indesign": Layout,
  "adobe xd": Grid,
  "adobe after effects": Film,
  "adobe premiere pro": Scissors,
  "adobe lightroom": Sun,
  "figma": Hexagon,
  "sketch": Feather,
  "canva": Palette,
  "coreldraw": Pen,
  "gimp": Brush,
  "inkscape": Edit3,
  "procreate": Paintbrush,
  "affinity designer": Triangle,
  "affinity photo": Aperture,
  "blender": Box,
  "cinema 4d": Maximize,
  "zbrush": Gem,
  "substance painter": Droplet,
  "davinci resolve": Monitor,
  "framer": Move,
  "webflow": Zap,
  "invision": Layers,
  "after effects": Film,
  "lightroom": Sun,
  "premiere pro": Scissors,
  "photoshop": Image,
  "illustrator": PenTool,
  "color grading": Sun,
  "retouching": Sparkles,
  "photo compositing": Layers,
  "substance designer": Droplet,
};

function getSkillIcon(name: string) {
  return SKILL_ICONS[name.toLowerCase()] || Star;
}

/* ─── Marquee Row ─── */
function MarqueeRow({
  skills,
  direction = "left",
  speed = 30,
}: {
  skills: Skill[];
  direction?: "left" | "right";
  speed?: number;
}) {
  const doubled = [...skills, ...skills, ...skills];
  const dur = skills.length * speed / 10;

  return (
    <div className="relative overflow-hidden py-2">
      <motion.div
        className="flex gap-4 w-max"
        animate={{
          x: direction === "left"
            ? ["0%", "-33.333%"]
            : ["-33.333%", "0%"],
        }}
        transition={{
          x: {
            duration: dur,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {doubled.map((skill, i) => {
          const Icon = getSkillIcon(skill.name);
          return (
            <div
              key={`${skill.id}-${i}`}
              className="group flex items-center gap-2.5 px-5 py-3 rounded-full
                         border border-white/[0.08] bg-white/[0.03]
                         hover:border-primary/40 hover:bg-primary/[0.08]
                         hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]
                         backdrop-blur-sm transition-all duration-500
                         cursor-default select-none flex-shrink-0"
            >
              <div className="p-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]
                              group-hover:bg-primary/20 group-hover:border-primary/30
                              transition-all duration-500">
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-500" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-500 whitespace-nowrap">
                {skill.name}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ─── Main Component ─── */
interface Skills3DSceneProps {
  skills: Skill[];
}

export default function Skills3DScene({ skills }: Skills3DSceneProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        No skills added yet.
      </div>
    );
  }

  // Split skills into 3 rows
  const third = Math.ceil(skills.length / 3);
  const row1 = skills.length > 0 ? skills.slice(0, third) : [];
  const row2 = skills.length > third ? skills.slice(third, third * 2) : [];
  const row3 = skills.length > third * 2 ? skills.slice(third * 2) : [];

  // If we have very few skills, duplicate to fill rows
  const padRow = (row: Skill[]) => {
    if (row.length === 0) return skills;
    while (row.length < 4) row = [...row, ...row];
    return row;
  };

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
      {/* Gradient masks on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 z-10 pointer-events-none"
           style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 z-10 pointer-events-none"
           style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }} />

      <div className="space-y-3 py-4">
        <MarqueeRow skills={padRow(row1)} direction="left" speed={35} />
        {row2.length > 0 && <MarqueeRow skills={padRow(row2)} direction="right" speed={28} />}
        {row3.length > 0 && <MarqueeRow skills={padRow(row3)} direction="left" speed={32} />}
      </div>
    </div>
  );
}
