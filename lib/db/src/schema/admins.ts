import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const adminsTable = pgTable("admins", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});
