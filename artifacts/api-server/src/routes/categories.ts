import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { productsTable } from "@workspace/db";

const router = Router();

router.get("/categories", async (_req, res) => {
  const cats = await db.select().from(categoriesTable);
  const counts = await db
    .select({ categoryId: productsTable.categoryId, cnt: sql<number>`count(*)::int` })
    .from(productsTable)
    .groupBy(productsTable.categoryId);
  const countMap = new Map(counts.map((c) => [c.categoryId, c.cnt]));
  res.json(cats.map((c) => ({ ...c, productCount: countMap.get(c.id) ?? 0 })));
});

router.post("/categories", async (req, res) => {
  const { name, icon } = req.body;
  if (!name) {
    res.status(400).json({ error: "name required" });
    return;
  }
  const [cat] = await db.insert(categoriesTable).values({ name, icon }).returning();
  res.status(201).json({ ...cat, productCount: 0 });
});

router.delete("/categories/:id", async (req, res) => {
  await db.delete(categoriesTable).where(eq(categoriesTable.id, Number(req.params.id)));
  res.status(204).end();
});

export default router;
