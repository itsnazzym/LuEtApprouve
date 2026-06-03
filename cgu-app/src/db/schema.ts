import { pgTable, uuid, text, varchar, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["GREEN", "ORANGE", "RED", "GRAY"]);
export const queueStatusEnum = pgEnum("queue_status", ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "NEEDS_APPROVAL"]);

export const platforms = pgTable("platforms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  logo_url: text("logo_url"),
  grade: varchar("grade", { length: 2 }).notNull(),
  summary: text("summary"),
  source_url: text("source_url").notNull(),
  content_hash: varchar("content_hash", { length: 64 }),
  last_rechecked_at: timestamp("last_rechecked_at"),
});

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  platform_id: uuid("platform_id")
    .references(() => platforms.id, { onDelete: "cascade" })
    .notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  url: text("url").notNull(),
});

export const dataPoints = pgTable("data_points", {
  id: uuid("id").defaultRandom().primaryKey(),
  platform_id: uuid("platform_id")
    .references(() => platforms.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: statusEnum("status").notNull(),
  description: text("description").notNull(),
  quote: text("quote"),
});

export const crawlQueue = pgTable("crawl_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  status: queueStatusEnum("status").default("PENDING").notNull(),
  phase: varchar("phase", { length: 255 }),
  error_message: text("error_message"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
