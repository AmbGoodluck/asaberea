import { requireAdmin, json } from "@/lib/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { getResource } from "@/lib/resources";
import { sanitizeObject } from "@/lib/sanitize";
import { COL } from "@/lib/firebase/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { name: string; id: string } };

function safeId(id: string) {
  return typeof id === "string" && id.length > 0 && id.length < 200 && !id.includes("/");
}

// PUT /api/admin/collection/:name/:id  -> replace fields (admin only)
export async function PUT(req: Request, { params }: Ctx) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = adminDb();
  if (!db) return json({ error: "not_configured" }, 503);
  const res = getResource(params.name);
  if (!res) return json({ error: "unknown_resource" }, 404);
  if (!safeId(params.id)) return json({ error: "bad_id" }, 400);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  const clean = sanitizeObject((body ?? {}) as Record<string, unknown>);
  const parsed = res.schema.safeParse(clean);
  if (!parsed.success) return json({ error: "invalid", issues: parsed.error.flatten() }, 422);

  await db.collection(res.collection).doc(params.id).set(parsed.data, { merge: true });
  return json({ id: params.id, ...parsed.data });
}

// PATCH /api/admin/collection/contacts/:id  -> mark read/unread
export async function PATCH(req: Request, { params }: Ctx) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = adminDb();
  if (!db) return json({ error: "not_configured" }, 503);
  if (params.name !== "contacts") return json({ error: "unsupported" }, 400);
  if (!safeId(params.id)) return json({ error: "bad_id" }, 400);

  let body: { read?: boolean } = {};
  try {
    body = await req.json();
  } catch {}
  await db.collection(COL.contacts).doc(params.id).set({ read: Boolean(body.read) }, { merge: true });
  return json({ id: params.id, read: Boolean(body.read) });
}

// DELETE /api/admin/collection/:name/:id
export async function DELETE(req: Request, { params }: Ctx) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = adminDb();
  if (!db) return json({ error: "not_configured" }, 503);
  const res = getResource(params.name);
  const collection = res?.collection || (params.name === "contacts" ? COL.contacts : null);
  if (!collection) return json({ error: "unknown_resource" }, 404);
  if (!safeId(params.id)) return json({ error: "bad_id" }, 400);

  await db.collection(collection).doc(params.id).delete();
  return json({ ok: true });
}
