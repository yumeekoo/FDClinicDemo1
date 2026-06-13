import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be defined");
}

// Database Connection for Server-Side (Admin) Operations
const connectionString = process.env.DATABASE_URL;

// For query purposes, use connection pooling if needed.
// postgres-js connection client.
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
export type DbClient = typeof db;
