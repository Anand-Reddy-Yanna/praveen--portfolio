import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage.js";
import { verifyPassword } from "./hash.js";
import type { User } from "../shared/schema.js";
import type { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { isSecureCookieRequest } from "./config.js";

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const secret = process.env.SESSION_SECRET || require("crypto").randomBytes(32).toString("hex");
  const secureCookies = isSecureCookieRequest();

  app.set("trust proxy", 1);
  app.use(
    session({
      secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: secureCookies,
        sameSite: secureCookies ? "none" : "lax",
        httpOnly: true,
        maxAge: 86400000,
      },
      store: new MemoryStore({ checkPeriod: 86400000 }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !verifyPassword(password, user.password))
          return done(null, false, { message: "Invalid credentials" });
        return done(null, user);
      } catch (err) { return done(err); }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (err) { done(err); }
  });

  app.post("/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ id: user.id, username: user.username });
      });
    })(req, res, next);
  });

  app.post("/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  app.get("/auth/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user as User;
    res.json({ id: user.id, username: user.username });
  });
}

export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
  next();
}
