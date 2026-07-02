import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable, customersTable, orderItemsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// All admin routes require admin role
router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const [orderStats] = await db
    .select({
      totalSales: sql<number>`coalesce(sum(total_amount::numeric), 0)`,
      totalOrders: sql<number>`count(*)::int`,
      pendingOrders: sql<number>`count(*) filter (where status = 'pending')::int`,
      deliveredOrders: sql<number>`count(*) filter (where status = 'delivered')::int`,
    })
    .from(ordersTable);

  const [productStats] = await db
    .select({ totalProducts: sql<number>`count(*)::int` })
    .from(productsTable);

  const [customerStats] = await db
    .select({ totalCustomers: sql<number>`count(*)::int` })
    .from(customersTable);

  const topProductsRaw = await db
    .select({
      productId: orderItemsTable.productId,
      productName: orderItemsTable.productName,
      totalSold: sql<number>`sum(quantity)::int`,
    })
    .from(orderItemsTable)
    .groupBy(orderItemsTable.productId, orderItemsTable.productName)
    .orderBy(desc(sql`sum(quantity)`))
    .limit(5);

  res.json({
    totalSales: Number(orderStats?.totalSales ?? 0),
    totalOrders: Number(orderStats?.totalOrders ?? 0),
    pendingOrders: Number(orderStats?.pendingOrders ?? 0),
    deliveredOrders: Number(orderStats?.deliveredOrders ?? 0),
    totalProducts: Number(productStats?.totalProducts ?? 0),
    totalCustomers: Number(customerStats?.totalCustomers ?? 0),
    topProducts: topProductsRaw.map((p) => ({ id: p.productId, name: p.productName, totalSold: p.totalSold })),
  });
});

export default router;
