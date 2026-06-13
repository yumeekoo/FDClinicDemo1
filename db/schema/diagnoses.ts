import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { visits } from "./visits";
import { profiles } from "./users";

export const diagnosisTypeEnum = pgEnum("diagnosis_type", [
  "PRIMARY",
  "SECONDARY",
  "COMPLICATION"
]);

export const diagnoses = pgTable("diagnoses", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitId: uuid("visit_id")
    .references(() => visits.id, { onDelete: "cascade" })
    .notNull(),
  icd10Code: varchar("icd10_code", { length: 10 }).notNull(),
  icd10Description: text("icd10_description").notNull(),
  diagnosisType: diagnosisTypeEnum("diagnosis_type").notNull(),
  notes: text("notes"),
  createdBy: uuid("created_by")
    .references(() => profiles.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
