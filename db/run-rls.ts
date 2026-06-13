import { db } from "./index";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Applying RLS policies...");
  const sqlContent = fs.readFileSync(path.join(process.cwd(), "supabase", "migrations", "001_rls_policies.sql"), "utf-8");
  await db.execute(sql.raw(sqlContent));
  console.log("RLS policies applied successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error("Failed to apply RLS:", err);
  process.exit(1);
});
