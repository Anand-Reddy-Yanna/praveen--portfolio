import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { connectDB } from "./db.js";
import { storage } from "./storage.js";
import { setupAuth } from "./auth.js";
import { registerRoutes } from "./routes.js";
import { buildCorsMiddleware } from "./config.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shouldServeFrontend = process.env.SERVE_FRONTEND === "true";

async function main() {
  // Connect to MongoDB and seed data
  await connectDB();
  await storage.seed();

  const app = express();
  app.use(buildCorsMiddleware());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true }));

  setupAuth(app);
  registerRoutes(app);

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (shouldServeFrontend) {
    const distPath = path.resolve(__dirname, "../dist/public");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    app.get("/", (_req, res) => {
      res.json({ ok: true, service: "portfolio-api" });
    });
  }

  const server = createServer(app);
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch(console.error);
