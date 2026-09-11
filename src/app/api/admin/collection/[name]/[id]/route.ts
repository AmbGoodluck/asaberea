import { requireAdmin, json, guardRate } from "@/lib/auth-guard";
import { fdb } from "@/lib/firestore-rest";
import { getResource } from "@/lib/resources";
import { sanitizeObject } from "@/lib/sanitize";
import { COL } from "@/lib/firebase/schema";
import { slugify } from "@/lib/slug";

const SLUG_SOURCE: Record<string, string> = { events: "title", spotlights: "name" };

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
  if (!fdb.enabled) return json({ error: "not_configured" }, 503);
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
  const slugSource = SLUG_SOURCE[name];
  if (slugSource && !data.slug) {
    data.slug = slugify(String(data[slugSource] || ""));
  }
  const ok = await fdb.set(res.collection, id, data);
  if (!ok) return json({ error: "write_failed" }, 502);
  return json({ id, ...data });
}

// PATCH /api/admin/collection/contacts/:id  -> mark read/unread
export async function PATCH(req: Request, { params }: Ctx) {
  const limited = guardRate(req, "admin-write", 40, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!fdb.enabled) return json({ error: "not_configured" }, 503);
  const { name, id } = await params;
  if (name !== "contacts") return json({ error: "unsupported" }, 400);
  if (!safeId(id)) return json({ error: "bad_id" }, 400);

  let body: { read?: boolean } = {};
  try {
    body = await req.json();
  } catch {}
  const ok = await fdb.set(COL.contacts, id, { read: Boolean(body.read) });
  if (!ok) return json({ error: "write_failed" }, 502);
  return json({ id, read: Boolean(body.read) });
}

// DELETE /api/admin/collection/:name/:id
export async function DELETE(req: Request, { params }: Ctx) {
  const limited = guardRate(req, "admin-write", 40, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!fdb.enabled) return json({ error: "not_configured" }, 503);
  const { name, id } = await params;
  const res = getResource(name);
  const collection = res?.collection || (name === "contacts" ? COL.contacts : null);
  if (!collection) return json({ error: "unknown_resource" }, 404);
  if (!safeId(id)) return json({ error: "bad_id" }, 400);

  const ok = await fdb.del(collection, id);
  if (!ok) return json({ error: "delete_failed" }, 502);
  return json({ ok: true });
}
