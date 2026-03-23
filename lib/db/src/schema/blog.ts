import { pgTable, serial, text, timestamp, integer, primaryKey, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tagsTable = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  image: text("image"),
  status: text("status").notNull().default("draft"), // 'draft' | 'published'
  approved: boolean("approved").notNull().default(false),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  authorId: integer("author_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postTagsTable = pgTable("post_tags", {
  postId: integer("post_id").references(() => postsTable.id, { onDelete: "cascade" }).notNull(),
  tagId: integer("tag_id").references(() => tagsTable.id, { onDelete: "cascade" }).notNull(),
}, (t) => [primaryKey({ columns: [t.postId, t.tagId] })]);

export type Category = typeof categoriesTable.$inferSelect;
export type Tag = typeof tagsTable.$inferSelect;
export type Post = typeof postsTable.$inferSelect;
