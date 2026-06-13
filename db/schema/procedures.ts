import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { visits } from "./visits";
import { profiles } from "./users";

export const procedureStatusEnum = pgEnum("procedure_status", [
  "ORDERED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
]);

export const procedures = pgTable("procedures", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitId: uuid("visit_id")
    .references(() => visits.id, { onDelete: "cascade" })
    .notNull(),
  procedureName: varchar("procedure_name", { length: 255 }).notNull(),
  procedureCode: varchar("procedure_code", { length: 100 }),
  performedBy: uuid("performed_by")
    .references(() => profiles.id)
    .notNull(),
  status: procedureStatusEnum("status").notNull(),
  notes: text("notes"),
  report: text("report"), // biên bản thủ thuật
  performedAt: timestamp("performed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
