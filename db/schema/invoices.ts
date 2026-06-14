import { pgTable, uuid, varchar, decimal, timestamp, pgEnum, integer, index } from "drizzle-orm/pg-core";
import { visits } from "./visits";
import { branches } from "./branches";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "DRAFT",
  "PENDING",
  "PAID",
  "CANCELLED",
  "REFUNDED"
]);

export const invoiceItemTypeEnum = pgEnum("invoice_item_type", [
  "VISIT_FEE",
  "CLS",
  "PROCEDURE",
  "DRUG"
]);

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceCode: varchar("invoice_code", { length: 100 }).notNull().unique(),
  visitId: uuid("visit_id")
    .references(() => visits.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  branchId: uuid("branch_id")
    .references(() => branches.id)
    .notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0.00").notNull(),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  bhytAmount: decimal("bhyt_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  status: invoiceStatusEnum("status").notNull(),
  issuedAt: timestamp("issued_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => {
  return [
    index("invoices_branch_paid_idx").on(t.branchId, t.paidAt),
    index("invoices_status_idx").on(t.status),
  ];
});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),
  itemType: invoiceItemTypeEnum("item_type").notNull(),
  itemRefId: uuid("item_ref_id"), // FK to cls_orders, prescription_items, etc. (nullable)
  description: varchar("description", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  discountPct: decimal("discount_pct", { precision: 5, scale: 2 }).default("0.00").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
