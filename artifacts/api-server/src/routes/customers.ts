import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable, ordersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/customers", async (_req, res) => {
  const customers = await db.select().from(customersTable).orderBy(desc(customersTable.createdAt));
  const orderStats = await db
    .select({
      customerId: ordersTable.customerId,
      totalOrders: sql<number>`count(*)::int`,
      totalSpent: sql<number>`sum(total_amount::numeric)`,
    })
    .from(ordersTable)
    .groupBy(ordersTable.customerId);
  const statsMap = new Map(orderStats.map((s) => [s.customerId, s]));
  res.json(
    customers.map((c) => ({
      ...c,
      totalOrders: statsMap.get(c.id)?.totalOrders ?? 0,
      totalSpent: statsMap.get(c.id)?.totalSpent ? Number(statsMap.get(c.id)!.totalSpent) : 0,
    }))
  );
});

router.get("/customers/top", async (_req, res) => {
  const customers = await db
    .select()
    .from(customersTable)
    .orderBy(desc(customersTable.points))
    .limit(20);
  res.json(customers.map((c) => ({ ...c, totalOrders: null, totalSpent: null })));
});

router.get("/customers/:id", async (req, res) => {
  const [c] = await db.select().from(customersTable).where(eq(customersTable.id, Number(req.params.id)));
  if (!c) { res.status(404).json({ error: "Not found" }); return; }
  const [stats] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      totalSpent: sql<number>`sum(total_amount::numeric)`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.customerId, c.id));
  res.json({
    ...c,
    totalOrders: stats?.totalOrders ?? 0,
    totalSpent: stats?.totalSpent ? Number(stats.totalSpent) : 0,
  });
});

router.post("/customers", async (req, res) => {
  const { name, phone, email } = req.body;
  if (!name || !phone) { res.status(400).json({ error: "name and phone required" }); return; }
  const [c] = await db.insert(customersTable).values({ name, phone, email: email ?? null }).returning();
  res.status(201).json({ ...c, totalOrders: 0, totalSpent: 0 });
});

router.patch("/customers/:id", async (req, res) => {
  const { name, phone, email } = req.body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email;
  const [c] = await db.update(customersTable).set(updates).where(eq(customersTable.id, Number(req.params.id))).returning();
  if (!c) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...c, totalOrders: null, totalSpent: null });
});

router.patch("/customers/:id/points", async (req, res) => {
  const { points } = req.body;
  if (points == null) { res.status(400).json({ error: "points required" }); return; }
  const [current] = await db.select().from(customersTable).where(eq(customersTable.id, Number(req.params.id)));
  if (!current) { res.status(404).json({ error: "Not found" }); return; }
  const newPoints = Math.max(0, current.points + Number(points));
  const [c] = await db.update(customersTable).set({ points: newPoints }).where(eq(customersTable.id, Number(req.params.id))).returning();
  res.json({ ...c, totalOrders: null, totalSpent: null });
});

export default router;
