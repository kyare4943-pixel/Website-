import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, desc } from "drizzle-orm";

const router = Router();

router.get("/products", async (req, res) => {
  const { categoryId, search, featured } = req.query;
  let rows = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      stock: productsTable.stock,
      imageUrl: productsTable.imageUrl,
      categoryId: productsTable.categoryId,
      featured: productsTable.featured,
      createdAt: productsTable.createdAt,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id));

  if (categoryId) rows = rows.filter((p) => p.categoryId === Number(categoryId));
  if (search) rows = rows.filter((p) => p.name.toLowerCase().includes(String(search).toLowerCase()));
  if (featured === "true") rows = rows.filter((p) => p.featured);

  res.json(rows.map((r) => ({ ...r, price: Number(r.price) })));
});

router.get("/products/featured", async (_req, res) => {
  const rows = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      stock: productsTable.stock,
      imageUrl: productsTable.imageUrl,
      categoryId: productsTable.categoryId,
      featured: productsTable.featured,
      createdAt: productsTable.createdAt,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.featured, true))
    .limit(8);
  res.json(rows.map((r) => ({ ...r, price: Number(r.price) })));
});

router.get("/products/:id", async (req, res) => {
  const rows = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      stock: productsTable.stock,
      imageUrl: productsTable.imageUrl,
      categoryId: productsTable.categoryId,
      featured: productsTable.featured,
      createdAt: productsTable.createdAt,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, Number(req.params.id)));
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...rows[0], price: Number(rows[0].price) });
});

router.post("/products", async (req, res) => {
  const { name, description, price, stock, imageUrl, categoryId, featured } = req.body;
  if (!name || price == null) { res.status(400).json({ error: "name and price required" }); return; }
  const [p] = await db.insert(productsTable).values({
    name,
    description: description ?? null,
    price: String(price),
    stock: stock ?? 0,
    imageUrl: imageUrl ?? null,
    categoryId: categoryId ?? null,
    featured: featured ?? false,
  }).returning();
  res.status(201).json({ ...p, price: Number(p.price) });
});

router.patch("/products/:id", async (req, res) => {
  const { name, description, price, stock, imageUrl, categoryId, featured } = req.body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = String(price);
  if (stock !== undefined) updates.stock = stock;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (categoryId !== undefined) updates.categoryId = categoryId;
  if (featured !== undefined) updates.featured = featured;
  const [p] = await db.update(productsTable).set(updates).where(eq(productsTable.id, Number(req.params.id))).returning();
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...p, price: Number(p.price) });
});

router.delete("/products/:id", async (req, res) => {
  await db.delete(productsTable).where(eq(productsTable.id, Number(req.params.id)));
  res.status(204).end();
});

export default router;
