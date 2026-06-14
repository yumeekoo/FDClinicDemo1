import { pgTable, uuid, varchar, decimal, date, timestamp, index } from "drizzle-orm/pg-core";
import { branches } from "./branches";

export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  branchId: uuid("branch_id")
    .references(() => branches.id)
    .notNull(),
  drugName: varchar("drug_name", { length: 255 }).notNull(),
  drugCode: varchar("drug_code", { length: 100 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // e.g. "Viên", "Hộp"
  quantityInStock: decimal("quantity_in_stock", { precision: 10, scale: 2 }).default("0.00").notNull(),
  minStockThreshold: decimal("min_stock_threshold", { precision: 10, scale: 2 }).default("0.00").notNull(),
  expiryDate: date("expiry_date").notNull(),
  batchNumber: varchar("batch_number", { length: 100 }).notNull(),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => {
  return [
    index("inventory_branch_expiry_idx").on(t.branchId, t.expiryDate),
  ];
});
