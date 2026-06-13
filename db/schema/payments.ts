import { pgTable, uuid, decimal, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { invoices } from "./invoices";
import { profiles } from "./users";

export const paymentMethodEnum = pgEnum("payment_method", [
  "CASH",
  "CARD",
  "TRANSFER",
  "MOMO",
  "VNPAY"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED"
]);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull(),
  transactionId: varchar("transaction_id", { length: 255 }), // from payment gateway
  paidAt: timestamp("paid_at"),
  processedBy: uuid("processed_by")
    .references(() => profiles.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
