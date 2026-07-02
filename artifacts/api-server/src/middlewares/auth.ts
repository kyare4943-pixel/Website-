import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Aad u baahan tahay inaad gasho (login)" });
  }
  (req as any).userId = userId;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Aad u baahan tahay inaad gasho (login)" });
  }
  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.clerkUserId, userId))
    .limit(1);
  if (!admin) {
    return res.status(403).json({ error: "Oggolaansho kuma lihid (admin kaliya)" });
  }
  (req as any).userId = userId;
  next();
}
