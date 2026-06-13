import { pgTable, uuid, varchar, text, timestamp, pgEnum, boolean, integer, unique } from "drizzle-orm/pg-core";
import { branches } from "./branches";

export const genderEnum = pgEnum("gender", ["MALE", "FEMALE", "OTHER"]);

export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientCode: varchar("patient_code", { length: 100 }).notNull().unique(), // BN-YYYYMMDD-XXXX
  fullName: varchar("full_name", { length: 255 }).notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: genderEnum("gender").notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  cccd: varchar("cccd", { length: 50 }).unique(),
  bhytCode: varchar("bhyt_code", { length: 50 }),
  address: text("address").notNull(),
  bloodType: varchar("blood_type", { length: 10 }),
  allergies: text("allergies").array(),
  primaryBranchId: uuid("primary_branch_id")
    .references(() => branches.id)
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const patientBranchLinks = pgTable("patient_branch_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  branchId: uuid("branch_id")
    .references(() => branches.id, { onDelete: "cascade" })
    .notNull(),
  firstVisitAt: timestamp("first_visit_at").defaultNow().notNull(),
  lastVisitAt: timestamp("last_visit_at").defaultNow().notNull(),
  visitCount: integer("visit_count").default(0).notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
}, (t) => {
  return [
    unique("patient_branch_links_patient_id_branch_id_key").on(t.patientId, t.branchId),
  ];
});
