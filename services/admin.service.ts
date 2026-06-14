import { db } from "@/db";
import { visits, invoices, inventoryItems } from "@/db/schema";
import { eq, and, gte, lte, isNull, sql } from "drizzle-orm";

export async function getDashboardStats(targetBranchId?: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const sevenDaysAgoStart = new Date();
  sevenDaysAgoStart.setDate(sevenDaysAgoStart.getDate() - 6);
  sevenDaysAgoStart.setHours(0, 0, 0, 0);

  // 1. Visits Today
  const visitsConditions = [
    gte(visits.createdAt, todayStart),
    lte(visits.createdAt, todayEnd),
    isNull(visits.deletedAt)
  ];
  if (targetBranchId) visitsConditions.push(eq(visits.branchId, targetBranchId));

  // 2. Revenue Today
  const revenueConditions = [
    eq(invoices.status, "PAID"),
    gte(invoices.paidAt, todayStart),
    lte(invoices.paidAt, todayEnd)
  ];
  if (targetBranchId) revenueConditions.push(eq(invoices.branchId, targetBranchId));

  // 3. Drug Status
  const inventoryConditions = [
    sql`cast(${inventoryItems.quantityInStock} as decimal) > 0.00`
  ];
  if (targetBranchId) inventoryConditions.push(eq(inventoryItems.branchId, targetBranchId));

  // 4. Trend Conditions (Visits)
  const trendVisitsConditions = [
    gte(visits.createdAt, sevenDaysAgoStart),
    lte(visits.createdAt, todayEnd),
    isNull(visits.deletedAt)
  ];
  if (targetBranchId) trendVisitsConditions.push(eq(visits.branchId, targetBranchId));

  // 5. Trend Conditions (Revenue)
  const trendRevConditions = [
    eq(invoices.status, "PAID"),
    gte(invoices.paidAt, sevenDaysAgoStart),
    lte(invoices.paidAt, todayEnd)
  ];
  if (targetBranchId) trendRevConditions.push(eq(invoices.branchId, targetBranchId));

  // Execute queries concurrently for better performance
  const [
    visitsTodayRes,
    revenueTodayRes,
    items,
    visitsTrendRes,
    revenueTrendRes
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(visits).where(and(...visitsConditions)),
    db.select({ sum: sql<string>`sum(cast(${invoices.totalAmount} as decimal))` }).from(invoices).where(and(...revenueConditions)),
    db.select({ expiryDate: inventoryItems.expiryDate }).from(inventoryItems).where(and(...inventoryConditions)),
    
    // Group By query for 7 days visits
    db.select({
      date: sql<string>`to_char(${visits.createdAt}, 'DD/MM')`,
      count: sql<number>`count(*)`
    })
    .from(visits)
    .where(and(...trendVisitsConditions))
    .groupBy(sql`to_char(${visits.createdAt}, 'DD/MM')`),
    
    // Group By query for 7 days revenue
    db.select({
      date: sql<string>`to_char(${invoices.paidAt}, 'DD/MM')`,
      sum: sql<string>`sum(cast(${invoices.totalAmount} as decimal))`
    })
    .from(invoices)
    .where(and(...trendRevConditions))
    .groupBy(sql`to_char(${invoices.paidAt}, 'DD/MM')`)
  ]);

  const visitsToday = Number(visitsTodayRes[0]?.count || 0);
  const revenueToday = parseFloat(revenueTodayRes[0]?.sum || "0");

  // Calculate drug status
  const now = new Date();
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(now.getMonth() + 6);
  let expiredCount = 0;
  let warningCount = 0;
  let normalCount = 0;

  items.forEach((item) => {
    if (!item.expiryDate) {
      normalCount++;
      return;
    }
    const exp = new Date(item.expiryDate);
    if (exp <= now) expiredCount++;
    else if (exp <= sixMonthsLater) warningCount++;
    else normalCount++;
  });

  // Reconstruct 7 days trend array (ensuring 0 is filled for missing days)
  const trendData = [];
  const visitsMap = new Map(visitsTrendRes.map(v => [v.date, Number(v.count)]));
  const revenueMap = new Map(revenueTrendRes.map(r => [r.date, parseFloat(r.sum || "0")]));

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayLabel = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    
    trendData.push({
      date: dayLabel,
      visits: visitsMap.get(dayLabel) || 0,
      revenue: revenueMap.get(dayLabel) || 0,
    });
  }

  return {
    visitsToday,
    revenueToday,
    inventoryStats: {
      normal: normalCount,
      warning: warningCount,
      expired: expiredCount,
      total: items.length,
    },
    trendData,
  };
}
