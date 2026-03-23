import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../middlewares/auth.js";

const router = Router();

// POST /api/auth/setup — create first admin (only works when no admin exists)
router.post("/auth/setup", async (req, res) => {
  try {
    const admins = await db.select({ id: usersTable.id }).from(usersTable)
      .where(eq(usersTable.role, "admin")).limit(1);
    if (admins.length > 0) {
      res.status(409).json({ error: "Admin already exists. Use the login page." });
      return;
    }
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ error: "username, email, and password are required" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({ username, email, passwordHash, role: "admin" }).returning();
    const token = signToken({ id: user.id, email: user.email, role: "admin" });
    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err: any) {
    if (err?.code === "23505") { res.status(409).json({ error: "Email or username already registered" }); return; }
    console.error(err);
    res.status(500).json({ error: "Setup failed" });
  }
});

// POST /api/auth/register — contributor registration
router.post("/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: "username, email, and password are required" });
    return;
  }
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({ username, email, passwordHash, role: "contributor" }).returning();
    const token = signToken({ id: user.id, email: user.email, role: user.role as "admin" | "contributor" });
    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login — contributor + admin login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken({ id: user.id, email: user.email, role: user.role as "admin" | "contributor" });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me — get current user
router.get("/auth/me", requireAuth, async (req, res) => {
  const authUser = (req as any).user;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authUser.id)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const { passwordHash: _, ...safe } = user;
    res.json(safe);
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// GET /api/auth/status — check if admin exists (to show setup prompt)
router.get("/auth/status", async (_req, res) => {
  const admins = await db.select({ id: usersTable.id }).from(usersTable)
    .where(eq(usersTable.role, "admin")).limit(1);
  res.json({ hasAdmin: admins.length > 0 });
});

export default router;
