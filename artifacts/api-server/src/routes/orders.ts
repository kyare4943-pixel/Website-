import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, customersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

async function enrichOrder(order: typeof ordersTable.$inferSelect) {
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  let customerName: string | null = null;
  let customerPhone: string | null = null;
  if (order.customerId) {
    const [c] = await db.select().from(customersTable).where(eq(customersTable.id, order.customerId));
    customerName = c?.name ?? null;
    customerPhone = c?.phone ?? null;
  }

  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    customerName,
    customerPhone,
    items: items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
  };
}

router.get("/orders", async (req, res) => {
  const { status, customerId } = req.query;
  let rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  if (status) rows = rows.filter((o) => o.status === status);
  if (customerId) rows = rows.filter((o) => o.customerId === Number(customerId));
  const enriched = await Promise.all(rows.map(enrichOrder));
  res.json(enriched);
});

router.get("/orders/recent", async (_req, res) => {
  const rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10);
  const enriched = await Promise.all(rows.map(enrichOrder));
  res.json(enriched);
});

// My orders — returns orders for the currently logged-in Clerk user
router.get("/my/orders", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.clerkUserId, userId))
    .orderBy(desc(ordersTable.createdAt));
  const enriched = await Promise.all(rows.map(enrichOrder));
  res.json(enriched);
});

router.get("/orders/:id", async (req, res) => {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, Number(req.params.id)));
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichOrder(order));
});

router.post("/orders", async (req, res) => {
  const { customerId, items, totalAmount, notes, clerkUserId, paymentMethod, address, buyerName, buyerPhone } = req.body;
  if (!items?.length || totalAmount == null) {
    res.status(400).json({ error: "items and totalAmount required" });
    return;
  }
  const pointsEarned = Math.floor(Number(totalAmount));
  const [order] = await db
    .insert(ordersTable)
    .values({
      customerId: customerId ?? null,
      clerkUserId: clerkUserId ?? null,
      status: "pending",
      totalAmount: String(totalAmount),
      pointsEarned,
      paymentMethod: paymentMethod ?? null,
      address: address ?? null,
      buyerName: buyerName ?? null,
      buyerPhone: buyerPhone ?? null,
      notes: notes ?? null,
    })
    .returning();

  await db.insert(orderItemsTable).values(
    items.map((item: { productId: number; quantity: number; unitPrice: number; productName?: string }) => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName ?? "Alaab",
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
    }))
  );

  res.status(201).json(await enrichOrder(order));
});

router.patch("/orders/:id", async (req, res) => {
  const { status, notes } = req.body;
  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes;

  const [order] = await db
    .update(ordersTable)
    .set(updates)
    .where(eq(ordersTable.id, Number(req.params.id)))
    .returning();

  if (!order) { res.status(404).json({ error: "Not found" }); return; }

  if (status === "delivered" && order.customerId && order.pointsEarned) {
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, order.customerId));
    if (customer) {
      await db
        .update(customersTable)
        .set({ points: customer.points + order.pointsEarned })
        .where(eq(customersTable.id, order.customerId));
    }
  }

  res.json(await enrichOrder(order));
});

export default router;
