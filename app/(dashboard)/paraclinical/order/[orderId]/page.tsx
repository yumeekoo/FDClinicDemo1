import React from "react";
import { getClsOrderDetailAction } from "@/actions/paraclinical";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClsWorkspaceClient } from "./workspace-client";

export default async function ClsOrderWorkspacePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const res = await getClsOrderDetailAction(orderId);
  if (!res.success) {
    notFound();
  }

  return <ClsWorkspaceClient data={res.data} />;
}
