import { pgTable, uuid, varchar, boolean, timestamp, pgEnum, pgSchema } from "drizzle-orm/pg-core";
import { branches } from "./branches";

const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const roleEnum = pgEnum("user_role", [
  "ADMIN",
  "BRANCH_ADMIN",
  "RECEPTION",
  "DOCTOR",
  "PARACLINICAL",
  "CASHIER",
  "PHARMACIST"
]);

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  role: roleEnum("role").notNull(),
  branchId: uuid("branch_id")
    .references(() => branches.id)
    .notNull(),
  employeeCode: varchar("employee_code", { length: 100 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
