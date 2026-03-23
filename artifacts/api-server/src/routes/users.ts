import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

const router = Router();

const SAFE_COLS = {
  id: usersTable.id,
  username: usersTable.username,
  email: usersTable.email,
  role: usersTable.role,
  status: usersTable.status,
  firstName: usersTable.firstName,
  lastName: usersTable.lastName,
  phone: usersTable.phone,
  summary: usersTable.summary,
  profilePicture: usersTable.profilePicture,
  designation: usersTable.designation,
  twitter: usersTable.twitter,
  linkedin: usersTable.linkedin,
  github: usersTable.github,
  createdAt: usersTable.createdAt,
};

// GET /api/users — admin only: returns all users
router.get("/users", requireAdmin, async (_req, res) => {
  const rows = await db.select(SAFE_COLS).from(usersTable).orderBy(usersTable.createdAt);
  res.json(rows);
});

// GET /api/users/:id — auth required (own profile or admin)
router.get("/users/:id", requireAuth, async (req, res) => {
  const authUser = (req as any).user;
  const id = Number(req.params.id);
  if (authUser.role !== "admin" && authUser.id !== id) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const [user] = await db.select(SAFE_COLS).from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(user);
});

// PUT /api/users/:id — own profile or admin
router.put("/users/:id", requireAuth, async (req, res) => {
  const authUser = (req as any).user;
  const id = Number(req.params.id);
  if (authUser.role !== "admin" && authUser.id !== id) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const {
    username, email, password, firstName, lastName, phone,
    summary, profilePicture, designation, twitter, linkedin, github, role, status
  } = req.body;

  const update: Record<string, any> = {};
  if (username !== undefined) update.username = username;
  if (email !== undefined) update.email = email;
  if (password) update.passwordHash = await bcrypt.hash(password, 12);
  if (firstName !== undefined) update.firstName = firstName;
  if (lastName !== undefined) update.lastName = lastName;
  if (phone !== undefined) update.phone = phone;
  if (summary !== undefined) update.summary = summary;
  if (profilePicture !== undefined) update.profilePicture = profilePicture;
  if (designation !== undefined) update.designation = designation;
  if (twitter !== undefined) update.twitter = twitter;
  if (linkedin !== undefined) update.linkedin = linkedin;
  if (github !== undefined) update.github = github;
  if (role && authUser.role === "admin") update.role = role;
  if (status && authUser.role === "admin") update.status = status;

  try {
    const [user] = await db.update(usersTable).set(update).where(eq(usersTable.id, id)).returning();
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    const { passwordHash: _, ...safe } = user;
    res.json(safe);
  } catch (err: any) {
    if (err?.code === "23505") { res.status(409).json({ error: "Email or username already taken" }); return; }
    res.status(500).json({ error: "Failed to update user" });
  }
});

// POST /api/users/:id/approve — admin approves a contributor
router.post("/users/:id/approve", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [user] = await db.update(usersTable)
      .set({ status: "active" })
      .where(eq(usersTable.id, id)).returning();
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    const { passwordHash: _, ...safe } = user;
    res.json(safe);
  } catch {
    res.status(500).json({ error: "Failed to approve user" });
  }
});

// DELETE /api/users/:id — admin only
router.delete("/users/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ success: true });
});

export default router;
