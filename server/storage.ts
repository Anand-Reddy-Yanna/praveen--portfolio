import type {
  User, HeroSettings, Skill, Project, Message, SocialLink, ProjectSection,
  InsertHero, InsertSkill, InsertProject, InsertMessage, InsertSocialLink, InsertProjectSection
} from "../shared/schema";
import { hashPassword, verifyPassword } from "./hash.js";
import { UserModel, HeroModel, SkillModel, ProjectModel, MessageModel, SocialLinkModel, ProjectSectionModel } from "./models.js";

export { verifyPassword };

// Helper to convert mongoose doc to plain object with numeric id
function toPlain<T>(doc: any): T {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj._id) {
    obj.id = typeof obj._id === "object" ? obj._id.toString() : obj._id;
    delete obj._id;
  }
  delete obj.__v;
  return obj as T;
}

export class MongoStorage {
  async seed() {
    // Only seed if DB is empty (first run)
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      await UserModel.create({ username: "admin", password: hashPassword("admin123") });
      console.log("  → Seeded admin user (username: admin, password: admin123)");
    }

    const heroCount = await HeroModel.countDocuments();
    if (heroCount === 0) {
      await HeroModel.create({
        name: "Praveen", role: "Creative Artist & Designer",
        tagline: "Crafting stunning visuals through graphic design, photo editing, and 3D modeling. Bringing creative visions to life with pixel-perfect precision.",
        aboutText: "I'm a passionate creative professional with expertise in graphic design, photo editing, and 3D modeling. With years of experience working with leading brands and agencies, I bring a unique blend of artistic vision and technical skill to every project.",
        projectsText: "A curated selection of my best work across graphic design, photo editing, and 3D modeling.",
        contactEmail: "praveen@example.com",
        footerText: "© 2026 Praveen. All rights reserved.",
      });
      console.log("  → Seeded hero settings");
    }

    const skillCount = await SkillModel.countDocuments();
    if (skillCount === 0) {
      const seeds = [
        { name: "Adobe Photoshop", category: "design", proficiency: 95, icon: "Palette", sortOrder: 0 },
        { name: "Adobe Illustrator", category: "design", proficiency: 90, icon: "PenTool", sortOrder: 1 },
        { name: "Figma", category: "design", proficiency: 88, icon: "Layout", sortOrder: 2 },
        { name: "After Effects", category: "design", proficiency: 82, icon: "Film", sortOrder: 3 },
        { name: "Lightroom", category: "photo", proficiency: 92, icon: "Camera", sortOrder: 4 },
        { name: "Color Grading", category: "photo", proficiency: 88, icon: "Sun", sortOrder: 5 },
        { name: "Retouching", category: "photo", proficiency: 90, icon: "Sparkles", sortOrder: 6 },
        { name: "Photo Compositing", category: "photo", proficiency: 85, icon: "Layers", sortOrder: 7 },
        { name: "Blender", category: "3d", proficiency: 87, icon: "Box", sortOrder: 8 },
        { name: "Cinema 4D", category: "3d", proficiency: 80, icon: "Boxes", sortOrder: 9 },
        { name: "ZBrush", category: "3d", proficiency: 75, icon: "Gem", sortOrder: 10 },
        { name: "Substance Painter", category: "3d", proficiency: 78, icon: "Paintbrush", sortOrder: 11 },
      ];
      await SkillModel.insertMany(seeds);
      console.log("  → Seeded skills");
    }

    // Seed default project sections
    const sectionCount = await ProjectSectionModel.countDocuments();
    if (sectionCount === 0) {
      await ProjectSectionModel.insertMany([
        { name: "Graphic Design", sortOrder: 0 },
        { name: "Photo Editing", sortOrder: 1 },
        { name: "3D Modeling", sortOrder: 2 },
      ]);
      console.log("  → Seeded project sections");
    }

    // Migrate old projects: category → section
    const CATEGORY_TO_SECTION: Record<string, string> = {
      "design": "Graphic Design",
      "photo": "Photo Editing",
      "3d": "3D Modeling",
    };
    const oldProjects = await ProjectModel.find({ section: { $exists: false } });
    if (oldProjects.length > 0) {
      for (const p of oldProjects) {
        const cat = (p as any).category || "design";
        const sectionName = CATEGORY_TO_SECTION[cat] || "Graphic Design";
        await ProjectModel.findByIdAndUpdate(p._id, { $set: { section: sectionName }, $unset: { category: 1 } });
      }
      console.log(`  → Migrated ${oldProjects.length} projects from category → section`);
    }
    // Also fix projects that have category but empty/missing section
    const brokenProjects = await ProjectModel.find({ $or: [{ section: "" }, { section: null }] });
    if (brokenProjects.length > 0) {
      for (const p of brokenProjects) {
        const cat = (p as any).category || "design";
        const sectionName = CATEGORY_TO_SECTION[cat] || "Graphic Design";
        await ProjectModel.findByIdAndUpdate(p._id, { $set: { section: sectionName } });
      }
      console.log(`  → Fixed ${brokenProjects.length} projects with missing section`);
    }

    const projectCount = await ProjectModel.countDocuments();
    if (projectCount === 0) {
      const seeds = [
        { title: "Brand Identity System", section: "Graphic Design", imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80", imagePosition: "center", description: "Complete brand identity design including logo, color palette, typography, and brand guidelines for a modern tech startup.", isFeatured: true, sortOrder: 0 },
        { title: "Product Photography Edit", section: "Photo Editing", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", imagePosition: "center", description: "High-end product photography editing with advanced retouching, color correction, and compositing for e-commerce.", isFeatured: true, sortOrder: 1 },
        { title: "Architectural Visualization", section: "3D Modeling", imageUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80", imagePosition: "center", description: "Photorealistic 3D architectural visualization of a modern luxury residence.", isFeatured: true, sortOrder: 2 },
        { title: "Magazine Layout Design", section: "Graphic Design", imageUrl: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80", imagePosition: "center", description: "Editorial layout design for a high-fashion magazine featuring dynamic typography.", isFeatured: true, sortOrder: 3 },
        { title: "Portrait Retouching Series", section: "Photo Editing", imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80", imagePosition: "top", description: "Professional portrait retouching maintaining natural skin texture.", isFeatured: true, sortOrder: 4 },
        { title: "3D Character Design", section: "3D Modeling", imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80", imagePosition: "center", description: "Stylized 3D character design and modeling for an animated short film.", isFeatured: true, sortOrder: 5 },
      ];
      await ProjectModel.insertMany(seeds);
      console.log("  → Seeded projects");
    }
  }

  // ── Users ──
  async getUser(id: number | string) {
    const doc = await UserModel.findById(id);
    return doc ? toPlain<User>(doc) : undefined;
  }
  async getUserByUsername(username: string) {
    const doc = await UserModel.findOne({ username });
    return doc ? toPlain<User>(doc) : undefined;
  }

  // ── Hero ──
  async getHero() {
    const doc = await HeroModel.findOne();
    return doc ? toPlain<HeroSettings>(doc) : null;
  }
  async updateHero(data: Partial<InsertHero>) {
    const doc = await HeroModel.findOneAndUpdate({}, { $set: data }, { new: true });
    return doc ? toPlain<HeroSettings>(doc) : null;
  }

  // ── Skills ──
  async getSkills() {
    const docs = await SkillModel.find().sort({ sortOrder: 1 });
    return docs.map((d) => toPlain<Skill>(d));
  }
  async getSkill(id: string) {
    const doc = await SkillModel.findById(id);
    return doc ? toPlain<Skill>(doc) : undefined;
  }
  async createSkill(data: InsertSkill) {
    const count = await SkillModel.countDocuments();
    const doc = await SkillModel.create({ ...data, sortOrder: count });
    return toPlain<Skill>(doc);
  }
  async updateSkill(id: string, data: Partial<InsertSkill>) {
    const doc = await SkillModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toPlain<Skill>(doc) : undefined;
  }
  async deleteSkill(id: string) {
    await SkillModel.findByIdAndDelete(id);
    return true;
  }
  async reorderSkills(ids: string[]) {
    await Promise.all(ids.map((id, i) => SkillModel.findByIdAndUpdate(id, { sortOrder: i })));
  }

  // ── Project Sections ──
  async getProjectSections() {
    const docs = await ProjectSectionModel.find().sort({ sortOrder: 1 });
    return docs.map((d) => toPlain<ProjectSection>(d));
  }
  async createProjectSection(data: InsertProjectSection) {
    const count = await ProjectSectionModel.countDocuments();
    const doc = await ProjectSectionModel.create({ ...data, sortOrder: count });
    return toPlain<ProjectSection>(doc);
  }
  async deleteProjectSection(id: string) {
    const section = await ProjectSectionModel.findById(id);
    if (section) {
      // Also delete all projects in this section
      await ProjectModel.deleteMany({ section: section.name });
    }
    await ProjectSectionModel.findByIdAndDelete(id);
    return true;
  }
  async updateProjectSection(id: string, data: Partial<InsertProjectSection>) {
    const old = await ProjectSectionModel.findById(id);
    const doc = await ProjectSectionModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    // If name changed, update all projects referencing the old name
    if (old && data.name && old.name !== data.name) {
      await ProjectModel.updateMany({ section: old.name }, { $set: { section: data.name } });
    }
    return doc ? toPlain<ProjectSection>(doc) : undefined;
  }

  // ── Projects ──
  async getProjects() {
    const docs = await ProjectModel.find().sort({ sortOrder: 1 });
    return docs.map((d) => toPlain<Project>(d));
  }
  async getProject(id: string) {
    const doc = await ProjectModel.findById(id);
    return doc ? toPlain<Project>(doc) : undefined;
  }
  async createProject(data: InsertProject) {
    const count = await ProjectModel.countDocuments();
    const doc = await ProjectModel.create({
      ...data, sortOrder: count,
      videoUrl: data.videoUrl ?? null, content: data.content ?? null,
      imagePosition: data.imagePosition ?? "center", isFeatured: data.isFeatured ?? false,
    });
    return toPlain<Project>(doc);
  }
  async updateProject(id: string, data: Partial<InsertProject>) {
    const doc = await ProjectModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toPlain<Project>(doc) : undefined;
  }
  async deleteProject(id: string) {
    await ProjectModel.findByIdAndDelete(id);
    return true;
  }
  async reorderProjects(ids: string[]) {
    await Promise.all(ids.map((id, i) => ProjectModel.findByIdAndUpdate(id, { sortOrder: i })));
  }

  // ── Messages ──
  async getMessages() {
    const docs = await MessageModel.find().sort({ createdAt: -1 });
    return docs.map((d) => toPlain<Message>(d));
  }
  async createMessage(data: InsertMessage) {
    const doc = await MessageModel.create({ ...data, createdAt: new Date(), isRead: false });
    return toPlain<Message>(doc);
  }
  async deleteMessage(id: string) {
    await MessageModel.findByIdAndDelete(id);
    return true;
  }

  // ── Social Links ──
  async getSocialLinks() {
    const docs = await SocialLinkModel.find().sort({ sortOrder: 1 });
    return docs.map((d) => toPlain<SocialLink>(d));
  }
  async createSocialLink(data: InsertSocialLink) {
    const count = await SocialLinkModel.countDocuments();
    const doc = await SocialLinkModel.create({ ...data, sortOrder: count });
    return toPlain<SocialLink>(doc);
  }
  async updateSocialLink(id: string, data: Partial<InsertSocialLink>) {
    const doc = await SocialLinkModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    return doc ? toPlain<SocialLink>(doc) : undefined;
  }
  async deleteSocialLink(id: string) {
    await SocialLinkModel.findByIdAndDelete(id);
    return true;
  }

  // ── Password ──
  async updatePassword(userId: string, newPassword: string) {
    const doc = await UserModel.findByIdAndUpdate(userId, { password: hashPassword(newPassword) }, { new: true });
    return doc ? true : undefined;
  }
}

export const storage = new MongoStorage();
