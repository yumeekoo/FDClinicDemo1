import { pgTable, uuid, varchar, text, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { patients } from "./patients";
import { branches } from "./branches";
import { profiles } from "./users";

export const visitStatusEnum = pgEnum("visit_status", [
  "WAITING",
  "IN_PROGRESS",
  "CLS_PENDING",
  "COMPLETED",
  "CANCELLED",
  "PAID"
]);

export const visits = pgTable("visits", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitCode: varchar("visit_code", { length: 100 }).notNull().unique(), // KH-YYYYMMDD-XXXX
  patientId: uuid("patient_id")
    .references(() => patients.id)
    .notNull(),
  branchId: uuid("branch_id")
    .references(() => branches.id)
    .notNull(),
  doctorId: uuid("doctor_id")
    .references(() => profiles.id)
    .notNull(),
  receptionistId: uuid("receptionist_id")
    .references(() => profiles.id)
    .notNull(),
  status: visitStatusEnum("status").notNull(),
  chiefComplaint: text("chief_complaint").notNull(),
  medicalHistory: text("medical_history").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (t) => {
  return [
    index("visits_branch_created_idx").on(t.branchId, t.createdAt),
    index("visits_status_idx").on(t.status),
  ];
});
