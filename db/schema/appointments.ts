import { pgTable, uuid, timestamp, integer, pgEnum, text } from "drizzle-orm/pg-core";
import { patients } from "./patients";
import { branches } from "./branches";
import { profiles } from "./users";

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "BOOKED",
  "CONFIRMED",
  "ARRIVED",
  "CANCELLED",
  "NO_SHOW"
]);

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  branchId: uuid("branch_id")
    .references(() => branches.id)
    .notNull(),
  doctorId: uuid("doctor_id")
    .references(() => profiles.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").default(15).notNull(),
  status: appointmentStatusEnum("status").notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
