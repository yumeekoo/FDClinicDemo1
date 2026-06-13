import { pgTable, uuid, varchar, timestamp, text, pgEnum, integer } from "drizzle-orm/pg-core";
import { visits } from "./visits";
import { branches } from "./branches";
import { profiles } from "./users";

export const prescriptionStatusEnum = pgEnum("prescription_status", [
  "DRAFT",
  "CONFIRMED",
  "DISPENSED",
  "CANCELLED"
]);

export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  prescriptionCode: varchar("prescription_code", { length: 100 }).notNull().unique(),
  visitId: uuid("visit_id")
    .references(() => visits.id, { onDelete: "cascade" })
    .notNull(),
  branchId: uuid("branch_id")
    .references(() => branches.id)
    .notNull(),
  prescribedBy: uuid("prescribed_by")
    .references(() => profiles.id)
    .notNull(),
  status: prescriptionStatusEnum("status").notNull(),
  nationalPrescriptionSyncAt: timestamp("national_prescription_sync_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const prescriptionItems = pgTable("prescription_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  prescriptionId: uuid("prescription_id")
    .references(() => prescriptions.id, { onDelete: "cascade" })
    .notNull(),
  drugName: varchar("drug_name", { length: 255 }).notNull(),
  drugCode: varchar("drug_code", { length: 100 }),
  dosage: varchar("dosage", { length: 255 }).notNull(), // e.g. "500mg"
  frequency: varchar("frequency", { length: 255 }).notNull(), // e.g. "2 lần / ngày"
  durationDays: integer("duration_days").notNull(),
  quantity: integer("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // e.g. "Viên"
  instructions: text("instructions"), // e.g. "Uống sau ăn"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
