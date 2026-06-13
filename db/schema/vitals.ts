import { pgTable, uuid, integer, decimal, text, timestamp } from "drizzle-orm/pg-core";
import { visits } from "./visits";
import { profiles } from "./users";

export const vitals = pgTable("vitals", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitId: uuid("visit_id")
    .references(() => visits.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  bloodPressureSystolic: integer("blood_pressure_systolic").notNull(),
  bloodPressureDiastolic: integer("blood_pressure_diastolic").notNull(),
  heartRate: integer("heart_rate").notNull(),
  temperature: decimal("temperature", { precision: 4, scale: 1 }).notNull(), // e.g. 37.5
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(), // e.g. 65.50
  height: decimal("height", { precision: 5, scale: 2 }).notNull(), // e.g. 170.50
  spo2: integer("spo2").notNull(),
  notes: text("notes"),
  recordedBy: uuid("recorded_by")
    .references(() => profiles.id)
    .notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
