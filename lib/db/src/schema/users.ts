import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("contributor"), // 'admin' | 'contributor'
  status: text("status").notNull().default("active"),  // 'pending' | 'active'
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  summary: text("summary"),
  profilePicture: text("profile_picture"),
  designation: text("designation"),
  twitter: text("twitter"),
  linkedin: text("linkedin"),
  github: text("github"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
