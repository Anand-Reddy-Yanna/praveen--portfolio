import type { Express } from "express";
import { storage } from "./storage.js";
import { requireAuth } from "./auth.js";
import { verifyPassword } from "./hash.js";
import { insertSkillSchema, insertProjectSchema, insertMessageSchema, insertHeroSchema, insertSocialLinkSchema, insertProjectSectionSchema } from "../shared/schema.js";
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
  app.get("/api/project-sections", async (_req, res) => {
    res.json(await storage.getProjectSections());
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

  // Admin - Project Sections
  app.post("/api/project-sections", requireAuth, async (req, res) => {
    const result = insertProjectSectionSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
    try {
      res.status(201).json(await storage.createProjectSection(result.data));
    } catch (err: any) {
      if (err.code === 11000) return res.status(400).json({ message: "Section already exists" });
      throw err;
    }
  });
  app.patch("/api/project-sections/:id", requireAuth, async (req, res) => {
    const result = insertProjectSectionSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
    const section = await storage.updateProjectSection(req.params.id, result.data);
    if (!section) return res.status(404).json({ message: "Not found" });
    res.json(section);
  });
  app.delete("/api/project-sections/:id", requireAuth, async (req, res) => {
    await storage.deleteProjectSection(req.params.id);
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

  // Public - Social Links
  app.get("/api/social-links", async (_req, res) => {
    res.json(await storage.getSocialLinks());
  });

  // Admin - Social Links
  app.post("/api/social-links", requireAuth, async (req, res) => {
    const result = insertSocialLinkSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
    res.status(201).json(await storage.createSocialLink(result.data));
  });
  app.patch("/api/social-links/:id", requireAuth, async (req, res) => {
    const result = insertSocialLinkSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
    const link = await storage.updateSocialLink(req.params.id, result.data);
    if (!link) return res.status(404).json({ message: "Not found" });
    res.json(link);
  });
  app.delete("/api/social-links/:id", requireAuth, async (req, res) => {
    await storage.deleteSocialLink(req.params.id);
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

}
