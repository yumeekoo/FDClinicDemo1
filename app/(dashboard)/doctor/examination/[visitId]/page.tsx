import { db } from "@/db";
import { visits, patients, vitals, clsOrders, clsResults } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DoctorWorkspace } from "./workspace-client";

export default async function ExaminationPage({
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

  // Query visit details
  const visitRow = await db
    .select({
      visit: visits,
      patient: patients,
      vitals: vitals,
    })
    .from(visits)
    .innerJoin(patients, eq(visits.patientId, patients.id))
    .leftJoin(vitals, eq(visits.id, vitals.visitId))
    .where(eq(visits.id, visitId))
    .limit(1);

  if (visitRow.length === 0) {
    notFound();
  }

  const data = visitRow[0];

  // Query CLS orders for this visit
  const clsOrdersList = await db
    .select({
      order: clsOrders,
      result: clsResults,
    })
    .from(clsOrders)
    .leftJoin(clsResults, eq(clsOrders.id, clsResults.orderId))
    .where(eq(clsOrders.visitId, visitId));

  return (
    <DoctorWorkspace
      visit={data.visit}
      patient={data.patient}
      vitals={data.vitals}
      clsOrders={clsOrdersList}
    />
  );
}
