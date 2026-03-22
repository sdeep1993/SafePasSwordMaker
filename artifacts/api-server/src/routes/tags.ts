import { Router } from "express";
import { db } from "@workspace/db";
import { tagsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// GET /api/tags
router.get("/tags", async (_req, res) => {
  const rows = await db.select().from(tagsTable).orderBy(tagsTable.name);
  res.json(rows);
});

// POST /api/tags — contributors + admin
router.post("/tags", requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: "name is required" }); return; }
  try {
    const slug = toSlug(name);
    const [tag] = await db.insert(tagsTable).values({ name, slug }).returning();
    res.status(201).json(tag);
  } catch (err: any) {
    if (err?.code === "23505") { res.status(409).json({ error: "Tag already exists" }); return; }
    res.status(500).json({ error: "Failed to create tag" });
  }
});

// PUT /api/tags/:id — admin only
router.put("/tags/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: "name is required" }); return; }
  try {
    const slug = toSlug(name);
    const [tag] = await db.update(tagsTable).set({ name, slug }).where(eq(tagsTable.id, id)).returning();
    if (!tag) { res.status(404).json({ error: "Not found" }); return; }
    res.json(tag);
  } catch {
    res.status(500).json({ error: "Failed to update tag" });
  }
});

// DELETE /api/tags/:id — admin only
router.delete("/tags/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(tagsTable).where(eq(tagsTable.id, id));
  res.json({ success: true });
});

export default router;
