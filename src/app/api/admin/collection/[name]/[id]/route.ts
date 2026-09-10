import { requireAdmin, json, guardRate } from "@/lib/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { getResource } from "@/lib/resources";
import { sanitizeObject } from "@/lib/sanitize";
import { COL } from "@/lib/firebase/schema";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ name: string; id: string }> };

function safeId(id: string) {
  return typeof id === "string" && id.length > 0 && id.length < 200 && !id.includes("/");
}

// PUT /api/admin/collection/:name/:id  -> replace fields (admin only)
export async function PUT(req: Request, { params }: Ctx) {
  const limited = guardRate(req, "admin-write", 40, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = adminDb();
  if (!db) return json({ error: "not_configured" }, 503);
  const { name, id } = await params;
  const res = getResource(name);
  if (!res) return json({ error: "unknown_resource" }, 404);
  if (!safeId(id)) return json({ error: "bad_id" }, 400);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  const clean = sanitizeObject((body ?? {}) as Record<string, unknown>);
  const parsed = res.schema.safeParse(clean);
  if (!parsed.success) return json({ error: "invalid", issues: parsed.error.flatten() }, 422);

  const data = parsed.data as Record<string, unknown>;
  if (name === "events" && !data.slug) {
    data.slug = slugify(String(data.title || ""));
  }
  await db.collection(res.collection).doc(id).set(data, { merge: true });
  return json({ id, ...data });
}

// PATCH /api/admin/collection/contacts/:id  -> mark read/unread
export async function PATCH(req: Request, { params }: Ctx) {
  const limited = guardRate(req, "admin-write", 40, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = adminDb();
  if (!db) return json({ error: "not_configured" }, 503);
  const { name, id } = await params;
  if (name !== "contacts") return json({ error: "unsupported" }, 400);
  if (!safeId(id)) return json({ error: "bad_id" }, 400);

  let body: { read?: boolean } = {};
  try {
    body = await req.json();
  } catch {}
  await db.collection(COL.contacts).doc(id).set({ read: Boolean(body.read) }, { merge: true });
  return json({ id, read: Boolean(body.read) });
}

// DELETE /api/admin/collection/:name/:id
export async function DELETE(req: Request, { params }: Ctx) {
  const limited = guardRate(req, "admin-write", 40, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = adminDb();
  if (!db) return json({ error: "not_configured" }, 503);
  const { name, id } = await params;
  const res = getResource(name);
  const collection = res?.collection || (name === "contacts" ? COL.contacts : null);
  if (!collection) return json({ error: "unknown_resource" }, 404);
  if (!safeId(id)) return json({ error: "bad_id" }, 400);

  await db.collection(collection).doc(id).delete();
  return json({ ok: true });
}
