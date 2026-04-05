import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
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

/* ─── Hero ─── */
function HeroSection({ hero }: { hero: HeroSettings }) {
  const letters = hero.name.split("");
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 30%, hsl(270 100% 60% / 0.18) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 70% 60%, hsl(320 100% 60% / 0.08) 0%, transparent 70%), hsl(240 10% 4%)",
        }}
      />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-8 px-4 py-1.5 text-sm border-primary/40 text-primary bg-primary/5">
            ✦ Available for hire
          </Badge>
        </motion.div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-heading font-bold mb-6 leading-[0.9]">
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
              className="inline-block gradient-text"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-xl sm:text-2xl text-muted-foreground font-heading mb-4"
        >
          {hero.role}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10"
        >
          {hero.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
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
            className="gap-2 px-8 border-primary/40 hover:bg-primary/10"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Send className="w-4 h-4" /> Get In Touch
          </Button>
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
    <section id="about" className="py-28">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-mono text-sm tracking-wider uppercase">Who I Am</span>
          <h2 className="text-4xl sm:text-5xl font-heading font-bold gradient-text mt-2">
            About Me
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card glass-card-hover p-6 text-center transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl bg-white/5 mb-3 ${stat.color}`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-semibold text-lg">{stat.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">Expert Level</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 md:p-10"
        >
          <p className="text-muted-foreground leading-relaxed text-lg text-center max-w-3xl mx-auto">
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-mono text-sm tracking-wider uppercase">What I Do</span>
          <h2 className="text-4xl sm:text-5xl font-heading font-bold gradient-text mt-2">
            Skills & Expertise
          </h2>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-border/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((skill, i) => (
            <SkillCard key={skill.id} skill={skill} index={i} />
          ))}
        </div>
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
    <section id="projects" className="py-28">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <span className="text-primary font-mono text-sm tracking-wider uppercase">My Work</span>
          <h2 className="text-4xl sm:text-5xl font-heading font-bold gradient-text mt-2 mb-4">
            Featured Projects
          </h2>
          {hero.projectsText && (
            <p className="text-muted-foreground max-w-xl mx-auto">
              {hero.projectsText}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {featured.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <ProjectCard project={project} onClick={() => onSelect(project)} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link href="/projects">
            <Button size="lg" variant="outline" className="gap-2 border-primary/40 hover:bg-primary/10 px-8">
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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-primary font-mono text-sm tracking-wider uppercase">Say Hello</span>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold gradient-text mt-2">
              Get In Touch
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              Have a project in mind? Let's work together to bring your vision to life.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 md:p-10"
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
    <footer className="border-t border-border/50 bg-card/30">
      <div className="section-container py-16">
        <div className="grid sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-heading font-bold gradient-text mb-3">Praveen<span className="text-primary">.</span></h3>
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
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Get In Touch</h4>
            <a href={`mailto:${hero.contactEmail}`} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mb-4">
              <MailIcon className="w-4 h-4" /> {hero.contactEmail}
            </a>
            <div className="flex gap-3">
              {[Github, Linkedin, Twitter].map((Icon, i) => (
                <button key={i} className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-10 pt-8 text-center">
          <p className="text-muted-foreground/60 text-sm">{hero.footerText}</p>
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
