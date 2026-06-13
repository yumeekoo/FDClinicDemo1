import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { visits } from "./visits";
import { branches } from "./branches";
import { profiles } from "./users";

export const clsServiceTypeEnum = pgEnum("cls_service_type", [
  "LAB",
  "IMAGING",
  "ECG",
  "OTHER"
]);

export const clsOrderStatusEnum = pgEnum("cls_order_status", [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
]);

export const clsPriorityEnum = pgEnum("cls_priority", [
  "NORMAL",
  "URGENT"
]);

export const clsOrders = pgTable("cls_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderCode: varchar("order_code", { length: 100 }).notNull().unique(),
  visitId: uuid("visit_id")
    .references(() => visits.id, { onDelete: "cascade" })
    .notNull(),
  branchId: uuid("branch_id")
    .references(() => branches.id)
    .notNull(),
  orderedBy: uuid("ordered_by")
    .references(() => profiles.id)
    .notNull(),
  serviceName: varchar("service_name", { length: 255 }).notNull(),
  serviceType: clsServiceTypeEnum("service_type").notNull(),
  status: clsOrderStatusEnum("status").notNull(),
  priority: clsPriorityEnum("priority").notNull(),
  notes: text("notes"),
  orderedAt: timestamp("ordered_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
