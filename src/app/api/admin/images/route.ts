import { requireAdmin, json, guardRate } from "@/lib/auth-guard";
import { fdb } from "@/lib/firestore-rest";
import { imageSlotInput, COL } from "@/lib/firebase/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET all image slots
export async function GET(req: Request) {
  const limited = guardRate(req, "admin-read", 120, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!fdb.enabled) return json({ error: "not_configured" }, 503);
  const docs = (await fdb.list(COL.images)) || [];
  const items: Record<string, string> = {};
  for (const d of docs) {
    const url = (d as { url?: string }).url;
    if (url) items[d.id] = url;
  }
  return json({ items });
}

// PUT upsert a slot { slot, url }
export async function PUT(req: Request) {
  const limited = guardRate(req, "admin-write", 40, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!fdb.enabled) return json({ error: "not_configured" }, 503);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  const parsed = imageSlotInput.safeParse(body);
  if (!parsed.success) return json({ error: "invalid", issues: parsed.error.flatten() }, 422);

  const { slot, url } = parsed.data;
  if (slot.includes("/")) return json({ error: "bad_slot" }, 400);
  const ok = await fdb.set(COL.images, slot, { url, updatedAt: Date.now() });
  if (!ok) return json({ error: "write_failed" }, 502);
  return json({ slot, url });
}
