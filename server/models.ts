import mongoose, { Schema, type Document } from "mongoose";

// ── User ──
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
export const UserModel = mongoose.model("User", userSchema);

// ── Hero Settings ──
const heroSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  tagline: { type: String, required: true },
  aboutText: { type: String, required: true },
  projectsText: { type: String, default: "" },
  contactEmail: { type: String, required: true },
  footerText: { type: String, default: "" },
});
export const HeroModel = mongoose.model("Hero", heroSchema);

// ── Skill ──
const skillSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["design", "photo", "3d"], required: true },
  proficiency: { type: Number, required: true, min: 0, max: 100 },
  icon: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
});
export const SkillModel = mongoose.model("Skill", skillSchema);

// ── Project ──
const projectSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ["design", "photo", "3d"], required: true },
  imageUrl: { type: String, required: true },
  imagePosition: { type: String, enum: ["top", "center", "bottom", "left", "right"], default: "center" },
  videoUrl: { type: String, default: null },
  description: { type: String, required: true },
  content: { type: String, default: null },
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
});
export const ProjectModel = mongoose.model("Project", projectSchema);

// ── Message ──
const messageSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});
export const MessageModel = mongoose.model("Message", messageSchema);
