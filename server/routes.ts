import type { Express } from "express";
import { storage } from "./storage.js";
import { requireAuth } from "./auth.js";
import { verifyPassword } from "./hash.js";
import { insertSkillSchema, insertProjectSchema, insertMessageSchema, insertHeroSchema } from "../shared/schema.js";
import { z } from "zod";

export function registerRoutes(app: Express) {
  // Public
  app.get("/api/hero", async (_req, res) => {
    res.json(await storage.getHero());
  });
  app.get("/api/skills", async (_req, res) => {
    res.json(await storage.getSkills());
  });
  app.get("/api/projects", async (_req, res) => {
    res.json(await storage.getProjects());
  });
  app.post("/api/messages", async (req, res) => {
    const result = insertMessageSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
    res.status(201).json(await storage.createMessage(result.data));
  });

  // Admin - Hero
  app.patch("/api/hero", requireAuth, async (req, res) => {
    const result = insertHeroSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
    res.json(await storage.updateHero(result.data));
  });

  // Admin - Skills
  app.get("/api/skills/:id", requireAuth, async (req, res) => {
    const skill = await storage.getSkill(req.params.id);
    if (!skill) return res.status(404).json({ message: "Not found" });
    res.json(skill);
  });
  app.post("/api/skills", requireAuth, async (req, res) => {
    const result = insertSkillSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
    res.status(201).json(await storage.createSkill(result.data));
  });
  app.patch("/api/skills/:id", requireAuth, async (req, res) => {
    const result = insertSkillSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
    const skill = await storage.updateSkill(req.params.id, result.data);
    if (!skill) return res.status(404).json({ message: "Not found" });
    res.json(skill);
  });
  app.delete("/api/skills/:id", requireAuth, async (req, res) => {
    await storage.deleteSkill(req.params.id);
    res.json({ success: true });
  });
  app.post("/api/skills/reorder", requireAuth, async (req, res) => {
    await storage.reorderSkills(req.body.ids);
    res.json({ success: true });
  });

  // Admin - Projects
  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  });
  app.post("/api/projects", requireAuth, async (req, res) => {
    const result = insertProjectSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
    res.status(201).json(await storage.createProject(result.data));
  });
  app.patch("/api/projects/:id", requireAuth, async (req, res) => {
    const result = insertProjectSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
    const project = await storage.updateProject(req.params.id, result.data);
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  });
  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    await storage.deleteProject(req.params.id);
    res.json({ success: true });
  });
  app.post("/api/projects/reorder", requireAuth, async (req, res) => {
    await storage.reorderProjects(req.body.ids);
    res.json({ success: true });
  });

  // Admin - Messages
  app.get("/api/messages", requireAuth, async (_req, res) => {
    res.json(await storage.getMessages());
  });
  app.delete("/api/messages/:id", requireAuth, async (req, res) => {
    await storage.deleteMessage(req.params.id);
    res.json({ success: true });
  });

  // Admin - Change Password
  app.post("/api/change-password", requireAuth, async (req, res) => {
    const schema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });

    const user = await storage.getUser((req.user as any).id);
    if (!user || !verifyPassword(result.data.currentPassword, user.password)) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    await storage.updatePassword(String(user.id), result.data.newPassword);
    res.json({ success: true });
  });

  // AI Content Generation (simulated)
  app.post("/api/ai/generate", requireAuth, async (req, res) => {
    const { prompt, type } = req.body;

    // Simulated AI responses based on type
    const responses: Record<string, (prompt: string) => string> = {
      description: (p: string) => {
        const templates = [
          `A meticulously crafted ${p.toLowerCase()} that showcases exceptional attention to detail and creative vision. This project combines cutting-edge techniques with artistic sensibility to deliver a truly standout result that captivates audiences and elevates brand presence.`,
          `This ${p.toLowerCase()} represents a bold exploration of visual storytelling, blending innovative design principles with a deep understanding of user experience. Every element was carefully considered to create a cohesive and impactful narrative.`,
          `An immersive ${p.toLowerCase()} experience that pushes creative boundaries while maintaining functional excellence. The project demonstrates mastery of modern design tools and a keen eye for aesthetic harmony.`,
        ];
        return templates[Math.floor(Math.random() * templates.length)];
      },
      tagline: (p: string) => {
        const taglines = [
          `Transforming ideas into visual masterpieces — ${p}`,
          `Where creativity meets precision — ${p}`,
          `Elevating brands through exceptional ${p.toLowerCase()}`,
          `Crafting unforgettable visual experiences in ${p.toLowerCase()}`,
        ];
        return taglines[Math.floor(Math.random() * taglines.length)];
      },
      about: (_p: string) => {
        return `I'm a passionate creative professional with a deep commitment to visual excellence. With extensive experience across graphic design, photo editing, and 3D modeling, I bring a unique perspective that blends technical precision with artistic innovation. My work has been recognized for pushing creative boundaries while maintaining the highest standards of quality. I believe in the power of design to tell stories, evoke emotions, and drive meaningful connections between brands and their audiences.`;
      },
      content: (p: string) => {
        return `Project Details:\n\nThis ${p.toLowerCase()} was developed through an iterative creative process that prioritized both aesthetic impact and functional clarity.\n\nKey Highlights:\n• Concept development and mood board creation\n• Multiple design iterations with stakeholder feedback\n• High-fidelity production with attention to every detail\n• Final delivery optimized for multiple platforms and formats\n\nThe project demonstrates a sophisticated understanding of visual hierarchy, color theory, and modern design trends while maintaining a timeless quality that ensures lasting impact.`;
      },
    };

    const generator = responses[type] || responses.description;
    const generated = generator(prompt || "creative project");

    // Simulate a brief delay for realism
    await new Promise((r) => setTimeout(r, 800));
    res.json({ content: generated });
  });
}
