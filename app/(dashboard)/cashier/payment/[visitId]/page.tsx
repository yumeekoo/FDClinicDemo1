import React from "react";
import { getInvoiceDetailsAction } from "@/actions/cashier";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PaymentWorkspaceClient } from "./payment-client";

export default async function CashierPaymentPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const res = await getInvoiceDetailsAction(visitId);
  if (!res.success) {
    notFound();
  }

  return <PaymentWorkspaceClient initialData={res.data} />;
}
