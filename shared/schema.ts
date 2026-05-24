import { z } from "zod";

export interface User {
  id: number;
  username: string;
  password: string;
}

export interface HeroSettings {
  id: number;
  name: string;
  role: string;
  tagline: string;
  aboutText: string;
  projectsText: string;
  contactEmail: string;
  footerText: string;
}

export interface Skill {
  id: number;
  name: string;
  category: "design" | "photo" | "3d";
  proficiency: number;
  icon: string;
  sortOrder: number;
}

export interface Project {
  id: number;
  title: string;
  section: string;
  imageUrl: string;
  imagePosition: "top" | "center" | "bottom" | "left" | "right";
  videoUrl: string | null;
  description: string;
  content: string | null;
  isFeatured: boolean;
  sortOrder: number;
}

export interface ProjectSection {
  id: number;
  name: string;
  sortOrder: number;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  sortOrder: number;
}

export const insertMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const insertHeroSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  tagline: z.string().min(1),
  aboutText: z.string().min(1),
  projectsText: z.string().optional().default(""),
  contactEmail: z.string().email(),
  footerText: z.string().optional().default(""),
});

export const insertSkillSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["design", "photo", "3d"]),
  proficiency: z.number().min(0).max(100),
  icon: z.string().min(1),
});

export const insertProjectSchema = z.object({
  title: z.string().min(1),
  section: z.string().min(1),
  imageUrl: z.string().min(1),
  imagePosition: z.enum(["top", "center", "bottom", "left", "right"]).default("center"),
  videoUrl: z.string().nullable().optional(),
  description: z.string().min(1),
  content: z.string().nullable().optional(),
  isFeatured: z.boolean().default(false),
});

export const insertProjectSectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
});

export const insertSocialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertHero = z.infer<typeof insertHeroSchema>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertProjectSection = z.infer<typeof insertProjectSectionSchema>;
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
