import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  real,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),
  credits: integer("credits").notNull().default(0),
  plan: varchar("plan", { length: 50 }).default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const searches = pgTable("searches", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  niche: varchar("niche", { length: 255 }).notNull(),
  resultsRequested: integer("results_requested").notNull(),
  resultsFound: integer("results_found").default(0),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  searchId: uuid("search_id")
    .references(() => searches.id)
    .notNull(),
  businessName: varchar("business_name", { length: 500 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: text("website"),
  screenshotUrl: text("screenshot_url"),
  googleRating: real("google_rating"),
  reviewCount: integer("review_count"),
  placeId: varchar("place_id", { length: 255 }),
  aiAnalysis: jsonb("ai_analysis"),
  aiScore: integer("ai_score"),
  outreachMessage: text("outreach_message"),
  isSaved: boolean("is_saved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
