import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

// Load environment variables from .env.local
loadEnvConfig(process.cwd());

if (!process.env.DIRECT_URL) {
  throw new Error("DIRECT_URL is required for migrations");
}

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL,
  },
});
