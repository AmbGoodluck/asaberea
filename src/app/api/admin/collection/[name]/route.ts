import { requireAdmin, json, guardRate } from "@/lib/auth-guard";
import { fdb } from "@/lib/firestore-rest";
import { getResource } from "@/lib/resources";
import { sanitizeObject } from "@/lib/sanitize";
import { COL } from "@/lib/firebase/schema";
import { slugify } from "@/lib/slug";

// Resources with a public detail page get an auto-generated slug from this field.
const SLUG_SOURCE: Record<string, string> = { events: "title", spotlights: "name" };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET  /api/admin/collection/:name  -> list all docs (admin only)
export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const limited = guardRate(req, "admin-read", 120, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!fdb.enabled) return json({ error: "not_configured" }, 503);

  const { name } = await params;
  const allowed = getResource(name) || (name === "contacts" ? { collection: COL.contacts } : null);
  if (!allowed) return json({ error: "unknown_resource" }, 404);

  const items = (await fdb.list(allowed.collection)) || [];
  return json({ items });
}

// POST /api/admin/collection/:name  -> create a doc (admin only)
export async function POST(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const limited = guardRate(req, "admin-write", 40, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!fdb.enabled) return json({ error: "not_configured" }, 503);

  const { name } = await params;
  const res = getResource(name);
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

  const data = parsed.data as Record<string, unknown>;
  const slugSource = SLUG_SOURCE[name];
  if (slugSource && !data.slug) {
    data.slug = slugify(String(data[slugSource] || ""));
  }
  const doc = { ...data, createdAt: Date.now() };
  const saved = await fdb.add(res.collection, doc);
  if (!saved) return json({ error: "write_failed" }, 502);
  return json({ id: saved.id, ...doc }, 201);
}
