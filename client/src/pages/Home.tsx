import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import {
  ChevronDown, Send, Loader2, ArrowRight, Eye,
  Palette, Camera, Box, Github, Linkedin, Twitter, Mail as MailIcon,
} from "lucide-react";
import type { HeroSettings, Skill, Project } from "@shared/schema";
import { insertMessageSchema, type InsertMessage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import SkillCard from "@/components/SkillCard";
import ProjectCard from "@/components/ProjectCard";
import ProjectModal from "@/components/ProjectModal";
import Navbar from "@/components/Navbar";
import CursorGlow from "@/components/CursorGlow";

/* ─── Hero ─── */
function HeroSection({ hero }: { hero: HeroSettings }) {
  const letters = hero.name.split("");
  const { scrollY } = useScroll();
  const posterY = useTransform(scrollY, [0, 800], [0, 64]);
  const posterRotate = useTransform(scrollY, [0, 800], [0, -3]);
  const layerOneY = useTransform(scrollY, [0, 700], [0, -52]);
  const layerTwoY = useTransform(scrollY, [0, 700], [0, 38]);
  const titleY = useTransform(scrollY, [0, 600], [0, -24]);
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, hsl(var(--primary) / 0.2), transparent 28rem), radial-gradient(circle at 82% 12%, hsl(var(--accent) / 0.16), transparent 30rem), linear-gradient(135deg, hsl(225 32% 8%) 0%, hsl(230 30% 5%) 58%, hsl(260 32% 9%) 100%)",
        }}
      />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(0deg, hsl(0 0% 100%) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />

      <div className="section-container relative z-10 grid lg:grid-cols-[1.08fr_0.92fr] gap-10 items-center">
        <div>
        <motion.div
          style={{ y: layerOneY }}
          className="floating-glass absolute left-6 top-28 hidden h-16 w-16 rounded-full opacity-70 lg:block"
          animate={{ rotate: [0, 9, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{ y: layerTwoY }}
          className="floating-glass absolute bottom-28 left-[42%] hidden h-20 w-36 rounded-2xl opacity-60 lg:block"
          animate={{ rotate: [3, -4, 3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-8 px-4 py-1.5 text-sm border-white/20 bg-white/10 text-foreground backdrop-blur-xl">
            Open for commissions
          </Badge>
        </motion.div>

        <motion.h1
          style={{ y: titleY }}
          className="max-w-4xl text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-heading font-black mb-6 leading-[0.84] tracking-tight text-foreground"
        >
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: i * 0.06,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              whileHover={{ y: -10, rotate: i % 2 === 0 ? -4 : 4, scale: 1.04 }}
              className="kinetic-letter inline-block"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="studio-label mb-4"
        >
          {hero.role}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-muted-foreground max-w-xl leading-relaxed mb-10 text-lg"
        >
          {hero.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            size="lg"
            className="gap-2 px-8"
            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Eye className="w-4 h-4" /> View Projects
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 px-8"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Send className="w-4 h-4" /> Get In Touch
          </Button>
        </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, rotate: 2, y: 24 }}
          animate={{ opacity: 1, rotate: 0, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          style={{ y: posterY, rotate: posterRotate }}
          className="relative hidden lg:block"
        >
          <motion.div
            className="floating-glass absolute -right-4 -top-6 h-20 w-20 rounded-full opacity-75"
            animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="floating-glass absolute -bottom-5 -left-5 h-20 w-40 rounded-2xl opacity-70"
            animate={{ y: [0, 14, 0], rotate: [-4, 2, -4] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="floating-glass aspect-[4/5] rounded-3xl p-5">
            <div className="h-full rounded-2xl border border-white/15 p-5 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
                <span>Portfolio</span>
                <span>Studio 24</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <motion.div className="h-36 rounded-sm bg-primary/85" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="h-36 rounded-sm bg-accent/80 translate-y-10" animate={{ y: [40, 22, 40] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="h-36 rounded-sm bg-secondary/85 translate-y-4" animate={{ y: [16, 2, 16] }} transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }} />
              </div>
              <div>
                <p className="text-6xl xl:text-7xl font-heading font-black leading-none tracking-tight">GRAPHIC</p>
                <p className="text-6xl xl:text-7xl font-heading font-black leading-none tracking-tight text-primary">DESIGN</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
      </motion.div>
    </section>
  );
}

/* ─── About ─── */
function AboutSection({ hero }: { hero: HeroSettings }) {
  const stats = [
    { label: "Design", icon: Palette, color: "text-primary" },
    { label: "Photo", icon: Camera, color: "text-secondary" },
    { label: "3D", icon: Box, color: "text-accent" },
  ];

  return (
    <section id="about" className="py-28 bg-card/[0.35]">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 44, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
          className="mb-12"
        >
          <span className="studio-label">Who I Am</span>
          <h2 className="text-4xl sm:text-6xl font-heading font-black text-foreground mt-3 tracking-tight">
            About Me
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: i * 0.08, duration: 0.62, ease: [0.2, 0.9, 0.2, 1] }}
              className="glass-card glass-card-hover p-6 transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-md bg-background border border-white/10 mb-3 ${stat.color}`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-black text-lg">{stat.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">Expert Level</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 36, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.16, duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
          className="glass-card p-8 md:p-10 border-l-4 border-l-primary"
        >
          <p className="text-muted-foreground leading-relaxed text-xl max-w-3xl">
            {hero.aboutText}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Skills Grid ─── */
function SkillsSection({ skills }: { skills: Skill[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { value: "all", label: "All Skills" },
    { value: "design", label: "Design" },
    { value: "photo", label: "Photography" },
    { value: "3d", label: "3D Modeling" },
  ];

  const filtered = activeCategory === "all"
    ? skills
    : skills.filter((s) => s.category === activeCategory);

  return (
    <section id="skills" className="py-28">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 44, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
          className="mb-12"
        >
          <span className="studio-label">What I Do</span>
          <h2 className="text-4xl sm:text-6xl font-heading font-black text-foreground mt-3 tracking-tight">
            Skills & Expertise
          </h2>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.62, ease: [0.2, 0.9, 0.2, 1] }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2 rounded-md text-sm font-bold transition-all duration-300 border ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground border-white/25 shadow-[0_14px_40px_hsl(var(--primary)/0.24)]"
                  : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((skill, i) => (
            <SkillCard key={skill.id} skill={skill} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Projects Grid ─── */
function ProjectsSection({
  projects,
  hero,
  onSelect,
}: {
  projects: Project[];
  hero: HeroSettings;
  onSelect: (p: Project) => void;
}) {
  const featured = projects.filter((p) => p.isFeatured);
  return (
    <section id="projects" className="py-28 bg-card/[0.35]">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 44, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
          className="mb-4"
        >
          <span className="studio-label">My Work</span>
          <h2 className="text-4xl sm:text-6xl font-heading font-black text-foreground mt-3 mb-4 tracking-tight">
            Featured Projects
          </h2>
          {hero.projectsText && (
            <p className="text-muted-foreground max-w-xl">
              {hero.projectsText}
            </p>
          )}
        </motion.div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {featured.map((project, i) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}
            >
              <ProjectCard project={project} onClick={() => onSelect(project)} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link href="/projects">
            <Button size="lg" variant="outline" className="gap-2 px-8">
              View All Projects <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Contact ─── */
function ContactSection() {
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InsertMessage>({
    resolver: zodResolver(insertMessageSchema),
  });
  const mutation = useMutation({
    mutationFn: (data: InsertMessage) =>
      apiRequest("/api/messages", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Message sent!", description: "Thank you for reaching out. I'll get back to you soon.", variant: "success" });
      reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    },
  });

  return (
    <section id="contact" className="py-28">
      <div className="section-container">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 44, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
            className="text-center mb-12"
          >
            <span className="studio-label justify-center">Say Hello</span>
            <h2 className="text-4xl sm:text-6xl font-heading font-black text-foreground mt-3 tracking-tight">
              Get In Touch
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              Have a project in mind? Let's work together to bring your vision to life.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.16, duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
            className="glass-card p-8 md:p-10 border-t-4 border-t-secondary"
          >
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input placeholder="Your name" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input type="email" placeholder="your@email.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea placeholder="Tell me about your project..." rows={5} {...register("message")} />
                {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
              </div>
              <Button type="submit" size="lg" className="w-full gap-2" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {mutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer({ hero }: { hero: HeroSettings }) {
  return (
    <footer className="border-t border-white/10 bg-card/60 text-foreground backdrop-blur-xl">
      <div className="section-container py-16">
        <div className="grid sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-heading font-black text-foreground mb-3">Praveen<span className="text-accent">.</span></h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Creative professional specializing in graphic design, photo editing, and 3D modeling.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              {[
                { label: "About", id: "about" },
                { label: "Skills", id: "skills" },
                { label: "Projects", id: "projects" },
                { label: "Contact", id: "contact" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors text-left"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Get In Touch</h4>
            <a href={`mailto:${hero.contactEmail}`} className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-2 mb-4">
              <MailIcon className="w-4 h-4" /> {hero.contactEmail}
            </a>
            <div className="flex gap-3">
              {[Github, Linkedin, Twitter].map((Icon, i) => (
                <button key={i} className="p-2 rounded-md bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 text-center">
          <p className="text-muted-foreground text-sm">{hero.footerText}</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Home Page ─── */
export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: hero } = useQuery<HeroSettings>({
    queryKey: ["hero"],
    queryFn: () => apiRequest("/api/hero"),
  });
  const { data: skills } = useQuery<Skill[]>({
    queryKey: ["skills"],
    queryFn: () => apiRequest("/api/skills"),
  });
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => apiRequest("/api/projects"),
  });

  if (!hero || !skills || !projects) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="bg-background text-foreground">
      <div className="animated-bg" />
      <CursorGlow />
      <Navbar />
      <HeroSection hero={hero} />
      <div className="section-divider" />
      <AboutSection hero={hero} />
      <div className="section-divider" />
      <SkillsSection skills={skills} />
      <div className="section-divider" />
      <ProjectsSection projects={projects} hero={hero} onSelect={setSelectedProject} />
      <div className="section-divider" />
      <ContactSection />
      <Footer hero={hero} />

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </main>
  );
}

