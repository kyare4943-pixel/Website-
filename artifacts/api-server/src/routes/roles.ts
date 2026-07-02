import { Router } from "express";
import { db } from "@workspace/db";
import { adminsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

// Check if current user is admin (or if no admins exist yet - bootstrap)
router.get("/me/role", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.clerkUserId, userId))
    .limit(1);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(adminsTable);

  res.json({
    isAdmin: !!admin,
    noAdminsYet: Number(count) === 0,
  });
});

// Bootstrap: first user makes themselves admin when no admins exist
router.post("/me/become-first-admin", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(adminsTable);

  if (Number(count) > 0) {
    return res.status(403).json({ error: "Horey admin baa jiray." });
  }

  await db.insert(adminsTable).values({ clerkUserId: userId }).onConflictDoNothing();
  res.json({ ok: true, message: "Admin waad noqotay (kii ugu horreeyay)" });
});

// List all admins (admin only)
router.get("/admin/roles", requireAdmin, async (_req, res) => {
  const admins = await db.select().from(adminsTable).orderBy(adminsTable.addedAt);
  res.json(admins);
});

// Add a new admin by Clerk user ID (admin only)
router.post("/admin/roles", requireAdmin, async (req, res) => {
  const { clerkUserId } = req.body;
  if (!clerkUserId || typeof clerkUserId !== "string") {
    return res.status(400).json({ error: "clerkUserId ayaa waajib ah" });
  }
  await db.insert(adminsTable).values({ clerkUserId }).onConflictDoNothing();
  res.json({ ok: true });
});

// Remove an admin (admin only, cannot remove yourself)
router.delete("/admin/roles/:clerkUserId", requireAdmin, async (req, res) => {
  const { clerkUserId } = req.params;
  const me = (req as any).userId;
  if (clerkUserId === me) {
    return res.status(400).json({ error: "Nafta lagaama saari karo admin-ka" });
  }
  await db.delete(adminsTable).where(eq(adminsTable.clerkUserId, clerkUserId));
  res.json({ ok: true });
});

// List ALL registered Clerk users + their admin status (admin only)
router.get("/admin/users", requireAdmin, async (_req, res) => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return res.status(500).json({ error: "CLERK_SECRET_KEY missing" });

  // Fetch all Clerk users (up to 500)
  const clerkRes = await fetch("https://api.clerk.com/v1/users?limit=100&order_by=-created_at", {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!clerkRes.ok) {
    return res.status(500).json({ error: "Clerk API khalad" });
  }
  const clerkData = await clerkRes.json();
  const clerkUsers: any[] = Array.isArray(clerkData) ? clerkData : (clerkData.data || []);

  // Get current admin IDs
  const admins = await db.select().from(adminsTable);
  const adminSet = new Set(admins.map((a) => a.clerkUserId));

  const users = clerkUsers.map((u: any) => ({
    id: u.id,
    firstName: u.first_name || "",
    lastName: u.last_name || "",
    email: u.email_addresses?.[0]?.email_address ?? null,
    imageUrl: u.image_url ?? null,
    createdAt: u.created_at,
    isAdmin: adminSet.has(u.id),
  }));

  res.json(users);
});

export default router;
