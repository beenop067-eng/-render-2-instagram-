import { pgTable, serial, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysesTable = pgTable("analyses", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  fullName: text("full_name"),
  bio: text("bio"),
  followers: integer("followers").notNull().default(0),
  following: integer("following").notNull().default(0),
  postsCount: integer("posts_count").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  isPrivate: boolean("is_private").notNull().default(false),
  isBusinessAccount: boolean("is_business_account").notNull().default(false),
  profilePicUrl: text("profile_pic_url"),
  engagementRate: real("engagement_rate").notNull().default(0),
  avgLikes: real("avg_likes").default(0),
  avgComments: real("avg_comments").default(0),
  accountCategory: text("account_category"),
  externalUrl: text("external_url"),
  requestedBy: text("requested_by"),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({ id: true, analyzedAt: true });
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;
