import { requireAdmin, json, guardRate } from "@/lib/auth-guard";
import { fdb } from "@/lib/firestore-rest";
import { getResource } from "@/lib/resources";
import { COL } from "@/lib/firebase/schema";
import { mediaBucket } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PER_CALL = 40; // stays well under the Workers subrequest budget

function safeId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length < 200 && !id.includes("/");
}

// POST /api/admin/collection/:name/bulk-delete  { ids: string[] }  (admin only)
// Deletes every listed doc; for the gallery resource also removes the R2
// object behind each photo. Call in batches of <= 40 ids.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const limited = guardRate(req, "admin-bulk-delete", 30, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!fdb.enabled) return json({ error: "not_configured" }, 503);

  const { name } = await params;
  const res = getResource(name);
  const collection = res?.collection || (name === "contacts" ? COL.contacts : null);
  if (!collection) return json({ error: "unknown_resource" }, 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  const rawIds = (body as { ids?: unknown[] })?.ids;
  const ids = Array.isArray(rawIds) ? rawIds.filter(safeId) : [];
  if (!ids.length) return json({ error: "no_ids" }, 400);
  if (ids.length > MAX_PER_CALL) {
    return json({ error: "too_many", max: MAX_PER_CALL }, 400);
  }

  const bucket = name === "gallery" ? mediaBucket() : null;
  let deleted = 0;
  const failed: string[] = [];

  for (const id of ids) {
    try {
      if (bucket) {
        const doc = await fdb.get(collection, id);
        const url = typeof doc?.imageUrl === "string" ? doc.imageUrl : "";
        if (url.startsWith("/media/")) {
          const key = decodeURIComponent(url.slice("/media/".length));
          await bucket.delete(key).catch(() => {});
        }
      }
      const ok = await fdb.del(collection, id);
      if (ok) deleted++;
      else failed.push(id);
    } catch {
      failed.push(id);
    }
  }

  return json({ deleted, failed });
}
