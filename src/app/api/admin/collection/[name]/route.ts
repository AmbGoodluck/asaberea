import { requireAdmin, json, guardRate } from "@/lib/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { getResource } from "@/lib/resources";
import { sanitizeObject } from "@/lib/sanitize";
import { COL } from "@/lib/firebase/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET  /api/admin/collection/:name  -> list all docs (admin only)
export async function GET(req: Request, { params }: { params: { name: string } }) {
  const limited = guardRate(req, "admin-read", 120, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = adminDb();
  if (!db) return json({ error: "not_configured" }, 503);

  const name = params.name;
  const allowed = getResource(name) || (name === "contacts" ? { collection: COL.contacts } : null);
  if (!allowed) return json({ error: "unknown_resource" }, 404);

  const snap = await db.collection(allowed.collection).get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return json({ items });
}

// POST /api/admin/collection/:name  -> create a doc (admin only)
export async function POST(req: Request, { params }: { params: { name: string } }) {
  const limited = guardRate(req, "admin-write", 40, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = adminDb();
  if (!db) return json({ error: "not_configured" }, 503);

  const res = getResource(params.name);
  if (!res) return json({ error: "unknown_resource" }, 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  const clean = sanitizeObject((body ?? {}) as Record<string, unknown>);
  const parsed = res.schema.safeParse(clean);
  if (!parsed.success) return json({ error: "invalid", issues: parsed.error.flatten() }, 422);

  const doc = { ...parsed.data, createdAt: Date.now() };
  const ref = await db.collection(res.collection).add(doc);
  return json({ id: ref.id, ...doc }, 201);
}
