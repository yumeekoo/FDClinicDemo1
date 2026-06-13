"use server";

import { db } from "@/db";
import {
  clsOrders,
  clsResults,
  visits,
  patients,
  profiles,
  vitals,
} from "@/db/schema";
import { eq, and, gte, isNull, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import {
  submitClsResultSchema,
  SubmitClsResultInput,
} from "@/lib/validations/paraclinical";
import { revalidatePath } from "next/cache";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Get active/today's CLS orders for the current branch.
 */
export async function getParaclinicalQueueAction(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const currentBranchId = user.user_metadata?.branch_id;
    if (!currentBranchId) {
      return { success: false, error: "Tài khoản của bạn chưa được liên kết với chi nhánh nào" };
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const rows = await db
      .select({
        order: clsOrders,
        visit: visits,
        patient: patients,
        doctor: {
          id: profiles.id,
          fullName: profiles.fullName,
        },
        result: clsResults,
      })
      .from(clsOrders)
      .innerJoin(visits, eq(clsOrders.visitId, visits.id))
      .innerJoin(patients, eq(visits.patientId, patients.id))
      .innerJoin(profiles, eq(clsOrders.orderedBy, profiles.id))
      .leftJoin(clsResults, eq(clsOrders.id, clsResults.orderId))
      .where(
        and(
          eq(clsOrders.branchId, currentBranchId),
          gte(clsOrders.orderedAt, startOfToday)
        )
      )
      .orderBy(desc(clsOrders.orderedAt));

    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy danh sách y lệnh" };
  }
}

/**
 * Fetch detailed information for a single CLS order.
 */
export async function getClsOrderDetailAction(orderId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const rows = await db
      .select({
        order: clsOrders,
        visit: visits,
        patient: patients,
        doctor: {
          id: profiles.id,
          fullName: profiles.fullName,
        },
        vitals: vitals,
        result: clsResults,
      })
      .from(clsOrders)
      .innerJoin(visits, eq(clsOrders.visitId, visits.id))
      .innerJoin(patients, eq(visits.patientId, patients.id))
      .innerJoin(profiles, eq(clsOrders.orderedBy, profiles.id))
      .leftJoin(vitals, eq(visits.id, vitals.visitId))
      .leftJoin(clsResults, eq(clsOrders.id, clsResults.orderId))
      .where(eq(clsOrders.id, orderId))
      .limit(1);

    if (rows.length === 0) {
      return { success: false, error: "Không tìm thấy y lệnh cận lâm sàng" };
    }

    return { success: true, data: rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy thông tin y lệnh" };
  }
}

/**
 * Update CLS order status to IN_PROGRESS.
 */
export async function startClsOrderAction(orderId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const [updatedOrder] = await db
      .update(clsOrders)
      .set({
        status: "IN_PROGRESS",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(clsOrders.id, orderId),
          eq(clsOrders.status, "PENDING")
        )
      )
      .returning();

    if (!updatedOrder) {
      return { success: false, error: "Không tìm thấy y lệnh cận lâm sàng ở trạng thái chờ thực hiện" };
    }

    revalidatePath("/paraclinical");
    return { success: true, data: updatedOrder };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi bắt đầu thực hiện y lệnh" };
  }
}

/**
 * Submit CLS results, update status of order, and update visit status if all orders completed.
 */
export async function submitClsResultAction(input: SubmitClsResultInput): Promise<ActionResult<any>> {
  try {
    const validated = submitClsResultSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const result = await db.transaction(async (tx) => {
      // 1. Get the CLS order
      const [order] = await tx
        .select()
        .from(clsOrders)
        .where(eq(clsOrders.id, input.orderId))
        .limit(1);

      if (!order) {
        throw new Error("Không tìm thấy y lệnh cận lâm sàng");
      }

      // 2. Insert or update the result
      const existingResult = await tx
        .select()
        .from(clsResults)
        .where(eq(clsResults.orderId, input.orderId))
        .limit(1);

      let resultRecord;
      if (existingResult.length > 0) {
        [resultRecord] = await tx
          .update(clsResults)
          .set({
            performedBy: user.id,
            resultText: input.resultText,
            isAbnormal: input.isAbnormal,
            fileUrls: input.fileUrls,
            updatedAt: new Date(),
          })
          .where(eq(clsResults.orderId, input.orderId))
          .returning();
      } else {
        [resultRecord] = await tx
          .insert(clsResults)
          .values({
            orderId: input.orderId,
            performedBy: user.id,
            resultText: input.resultText,
            isAbnormal: input.isAbnormal,
            fileUrls: input.fileUrls,
          })
          .returning();
      }

      // 3. Update the order status to COMPLETED
      await tx
        .update(clsOrders)
        .set({
          status: "COMPLETED",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(clsOrders.id, input.orderId));

      // 4. Check all sibling orders for this visit
      const siblingOrders = await tx
        .select()
        .from(clsOrders)
        .where(eq(clsOrders.visitId, order.visitId));

      // If all are completed or cancelled, set visit status to IN_PROGRESS
      const allDone = siblingOrders.every(
        (o: any) =>
          o.id === input.orderId || o.status === "COMPLETED" || o.status === "CANCELLED"
      );

      if (allDone) {
        await tx
          .update(visits)
          .set({
            status: "IN_PROGRESS",
            updatedAt: new Date(),
          })
          .where(eq(visits.id, order.visitId));
      }

      return resultRecord;
    });

    revalidatePath("/paraclinical");
    revalidatePath(`/paraclinical/order/${input.orderId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lưu kết quả cận lâm sàng" };
  }
}
