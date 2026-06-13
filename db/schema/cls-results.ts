import { pgTable, uuid, text, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { clsOrders } from "./cls-orders";
import { profiles } from "./users";

export const clsResults = pgTable("cls_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => clsOrders.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  performedBy: uuid("performed_by")
    .references(() => profiles.id)
    .notNull(),
  resultText: text("result_text").notNull(),
  resultData: jsonb("result_data"), // structured results
  fileUrls: text("file_urls").array(), // uploaded images/PDFs from Supabase Storage
  isAbnormal: boolean("is_abnormal").default(false).notNull(),
  reviewedBy: uuid("reviewed_by")
    .references(() => profiles.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
