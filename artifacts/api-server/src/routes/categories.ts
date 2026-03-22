import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

const router = Router();

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// GET /api/categories — anyone can read
router.get("/categories", async (_req, res) => {
  const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  res.json(rows);
});

// POST /api/categories — admin only
router.post("/categories", requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: "name is required" }); return; }
  try {
    const slug = toSlug(name);
    const [cat] = await db.insert(categoriesTable).values({ name, slug }).returning();
    res.status(201).json(cat);
  } catch (err: any) {
    if (err?.code === "23505") { res.status(409).json({ error: "Category already exists" }); return; }
    res.status(500).json({ error: "Failed to create category" });
  }
});

// PUT /api/categories/:id — admin only
router.put("/categories/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: "name is required" }); return; }
  try {
    const slug = toSlug(name);
    const [cat] = await db.update(categoriesTable).set({ name, slug }).where(eq(categoriesTable.id, id)).returning();
    if (!cat) { res.status(404).json({ error: "Not found" }); return; }
    res.json(cat);
  } catch {
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE /api/categories/:id — admin only
router.delete("/categories/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ success: true });
});

export default router;
