import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import type { Project } from "@shared/schema";

interface ProjectCarouselProps {
  projects: Project[];
  onSelect?: (project: Project) => void;
}

export default function ProjectCarousel({ projects, onSelect }: ProjectCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const rafRef = useRef<number>();
  const autoScrollRef = useRef<number>();
  const draggedRef = useRef(false);

  // Duplicate projects for seamless loop
  const loopedProjects = projects.length > 0
    ? [...projects, ...projects, ...projects]
    : [];

  // ── Auto-scroll at 0.8px/frame ──
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || projects.length === 0) return;

    const tick = () => {
      if (!isPaused && !isDragging) {
        el.scrollLeft += 0.8;

        // Seamless reset: when we've scrolled past the 2nd copy, jump back to 1st copy
        const singleSetWidth = el.scrollWidth / 3;
        if (el.scrollLeft >= singleSetWidth * 2) {
          el.scrollLeft -= singleSetWidth;
        }
      }
      autoScrollRef.current = requestAnimationFrame(tick);
    };
    autoScrollRef.current = requestAnimationFrame(tick);

    return () => {
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
    };
  }, [isPaused, isDragging, projects.length]);

  // ── Mouse drag handlers ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    draggedRef.current = false;
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
    lastXRef.current = e.pageX;
    velocityRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    draggedRef.current = true;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
    velocityRef.current = e.pageX - lastXRef.current;
    lastXRef.current = e.pageX;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // Momentum/inertia
    const el = scrollRef.current;
    if (!el) return;
    let vel = velocityRef.current * 3;
    const decelerate = () => {
      if (Math.abs(vel) < 0.5) return;
      el.scrollLeft -= vel;
      vel *= 0.92;

      // Seamless reset during momentum
      const singleSetWidth = el.scrollWidth / 3;
      if (el.scrollLeft >= singleSetWidth * 2) el.scrollLeft -= singleSetWidth;
      if (el.scrollLeft <= 0) el.scrollLeft += singleSetWidth;

      rafRef.current = requestAnimationFrame(decelerate);
    };
    decelerate();
  }, []);

  // ── Horizontal wheel scroll ──
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.2;

        const singleSetWidth = el.scrollWidth / 3;
        if (el.scrollLeft >= singleSetWidth * 2) el.scrollLeft -= singleSetWidth;
        if (el.scrollLeft <= 0) el.scrollLeft += singleSetWidth;
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Start at position = 1 copy in, so we can scroll both directions
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || projects.length === 0) return;
    requestAnimationFrame(() => {
      const singleSetWidth = el.scrollWidth / 3;
      el.scrollLeft = singleSetWidth;
    });
  }, [projects.length]);

  if (projects.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No projects yet.
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false); setHoveredIndex(null); }}
    >
      {/* Edge gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-10 pointer-events-none"
           style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-10 pointer-events-none"
           style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }} />

      {/* Scroll indicator */}
      <div className="flex items-center justify-center gap-3 mb-6 text-xs text-muted-foreground/50">
        <motion.div
          className="font-mono uppercase tracking-[0.25em] flex items-center gap-3"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span>—</span>
          <span>GRAB OR SCROLL</span>
          <span>—</span>
        </motion.div>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setIsDragging(false); }}
        className="flex gap-5 overflow-x-auto overflow-y-hidden px-8 sm:px-16 pb-6 scrollbar-hide"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          perspective: "1200px",
        }}
      >
        {loopedProjects.map((project, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <motion.div
              key={`${project.id}-${index}`}
              className="flex-shrink-0 relative group"
              style={{ width: "clamp(280px, 22vw, 380px)" }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-white/[0.08]
                           bg-white/[0.02] backdrop-blur-sm
                           transition-shadow duration-500"
                animate={{
                  scale: isHovered ? 1.04 : 1,
                  rotateY: isHovered ? -3 : 0,
                  rotateX: isHovered ? 2 : 0,
                  boxShadow: isHovered
                    ? "0 30px 80px -12px hsl(var(--primary) / 0.25), 0 0 0 1px hsl(var(--primary) / 0.15)"
                    : "0 8px 30px -8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{ transformStyle: "preserve-3d" }}
                onClick={() => {
                  if (!draggedRef.current) onSelect?.(project);
                }}
              >
                {/* Image */}
                <div className="aspect-[3/4] overflow-hidden">
                  <motion.img
                    src={project.imageUrl}
                    alt="Project"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: project.imagePosition || "center" }}
                    animate={{
                      scale: isHovered ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
                    draggable={false}
                  />

                  {/* Hover overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* View indicator on hover */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl
                                    border border-white/20 flex items-center justify-center
                                    shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </motion.div>
                </div>

                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    background: isHovered
                      ? "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 55%, transparent 60%)"
                      : "linear-gradient(105deg, transparent 40%, transparent 60%)",
                  }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
