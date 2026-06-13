import React from "react";
import { db } from "@/db";
import { branches } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BranchesClient } from "./branches-client";

export default async function BranchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Only Super Admin can access branches page
  const role = user.user_metadata?.role;
  if (role !== "ADMIN") {
    redirect("/admin");
  }

  // Fetch all branches (active and inactive) directly from DB
  const list = await db.select().from(branches);

  return <BranchesClient initialBranches={list} />;
}
