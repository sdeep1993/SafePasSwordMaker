import { Router } from "express";
import { db } from "@workspace/db";
import { postsTable, postTagsTable, tagsTable, categoriesTable, usersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
    "-" + Date.now().toString(36);
}

async function getPostsWithMeta(where?: any) {
  const posts = where
    ? await db.select().from(postsTable).where(where).orderBy(postsTable.createdAt)
    : await db.select().from(postsTable).orderBy(postsTable.createdAt);

  const results = await Promise.all(posts.map(async (post) => {
    const tagRows = await db.select({ id: tagsTable.id, name: tagsTable.name, slug: tagsTable.slug })
      .from(postTagsTable)
      .innerJoin(tagsTable, eq(postTagsTable.tagId, tagsTable.id))
      .where(eq(postTagsTable.postId, post.id));

    let category = null;
    if (post.categoryId) {
      const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, post.categoryId)).limit(1);
      category = cat || null;
    }

    let author = null;
    if (post.authorId) {
      const [u] = await db.select({
        id: usersTable.id, username: usersTable.username, email: usersTable.email,
        firstName: usersTable.firstName, lastName: usersTable.lastName,
        designation: usersTable.designation, profilePicture: usersTable.profilePicture
      }).from(usersTable).where(eq(usersTable.id, post.authorId)).limit(1);
      author = u || null;
    }

    return { ...post, tags: tagRows, category, author };
  }));
  return results;
}

// GET /api/posts — public: only published + approved; admin: all
router.get("/posts", async (req, res) => {
  try {
    // Check if authenticated as admin
    let isAdmin = false;
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      try {
        const { verifyToken } = await import("../middlewares/auth.js");
        const payload = verifyToken(auth.slice(7));
        if (payload.role === "admin") isAdmin = true;
      } catch {}
    }

    const posts = isAdmin
      ? await getPostsWithMeta()
      : await getPostsWithMeta(and(eq(postsTable.status, "published"), eq(postsTable.approved, true)));
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET /api/posts/:id — public single post (by id or slug)
router.get("/posts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const posts = await getPostsWithMeta(eq(postsTable.id, id));
    if (!posts[0]) { res.status(404).json({ error: "Post not found" }); return; }
    res.json(posts[0]);
  } catch {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// GET /api/posts/by-slug/:slug — fetch post by slug
router.get("/posts/by-slug/:slug", async (req, res) => {
  try {
    const posts = await getPostsWithMeta(eq(postsTable.slug, req.params.slug));
    if (!posts[0]) { res.status(404).json({ error: "Post not found" }); return; }
    res.json(posts[0]);
  } catch {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST /api/posts — contributors + admin
router.post("/posts", requireAuth, async (req, res) => {
  const authUser = (req as any).user;
  const { title, content, excerpt, image, status, categoryId, tagIds } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: "title and content are required" });
    return;
  }
  try {
    const slug = toSlug(title);
    // Admin posts are auto-approved; contributor posts need approval
    const approved = authUser.role === "admin";
    const [post] = await db.insert(postsTable).values({
      title, slug, content, excerpt: excerpt || null, image: image || null,
      status: status || "draft",
      approved,
      categoryId: categoryId || null,
      authorId: authUser.id,
      updatedAt: new Date(),
    }).returning();

    if (tagIds?.length) {
      await db.insert(postTagsTable).values(tagIds.map((tid: number) => ({ postId: post.id, tagId: tid })));
    }
    const posts = await getPostsWithMeta(eq(postsTable.id, post.id));
    res.status(201).json(posts[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PUT /api/posts/:id — author or admin
router.put("/posts/:id", requireAuth, async (req, res) => {
  const authUser = (req as any).user;
  const id = Number(req.params.id);
  try {
    const [existing] = await db.select().from(postsTable).where(eq(postsTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "Post not found" }); return; }
    if (existing.authorId !== authUser.id && authUser.role !== "admin") {
      res.status(403).json({ error: "Forbidden" }); return;
    }

    const { title, content, excerpt, image, status, categoryId, tagIds } = req.body;
    const [post] = await db.update(postsTable).set({
      title: title ?? existing.title,
      content: content ?? existing.content,
      excerpt: excerpt ?? existing.excerpt,
      image: image ?? existing.image,
      status: status ?? existing.status,
      categoryId: categoryId ?? existing.categoryId,
      updatedAt: new Date(),
    }).where(eq(postsTable.id, id)).returning();

    if (tagIds !== undefined) {
      await db.delete(postTagsTable).where(eq(postTagsTable.postId, id));
      if (tagIds.length > 0) {
        await db.insert(postTagsTable).values(tagIds.map((tid: number) => ({ postId: id, tagId: tid })));
      }
    }

    const posts = await getPostsWithMeta(eq(postsTable.id, post.id));
    res.json(posts[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// POST /api/posts/:id/approve — admin only
router.post("/posts/:id/approve", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [post] = await db.update(postsTable)
      .set({ approved: true, updatedAt: new Date() })
      .where(eq(postsTable.id, id)).returning();
    if (!post) { res.status(404).json({ error: "Not found" }); return; }
    res.json(post);
  } catch {
    res.status(500).json({ error: "Failed to approve post" });
  }
});

// DELETE /api/posts/:id — author or admin
router.delete("/posts/:id", requireAuth, async (req, res) => {
  const authUser = (req as any).user;
  const id = Number(req.params.id);
  try {
    const [existing] = await db.select().from(postsTable).where(eq(postsTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    if (existing.authorId !== authUser.id && authUser.role !== "admin") {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    await db.delete(postTagsTable).where(eq(postTagsTable.postId, id));
    await db.delete(postsTable).where(eq(postsTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
