import { requireAdmin, json } from "@/lib/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { imageSlotInput, COL } from "@/lib/firebase/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET all image slots
export async function GET(req: Request) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = adminDb();
  if (!db) return json({ error: "not_configured" }, 503);
  const snap = await db.collection(COL.images).get();
  const items: Record<string, string> = {};
  snap.docs.forEach((d) => {
    const url = (d.data() as { url?: string }).url;
    if (url) items[d.id] = url;
  });
  return json({ items });
}

// PUT upsert a slot { slot, url }
export async function PUT(req: Request) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = adminDb();
  if (!db) return json({ error: "not_configured" }, 503);

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
  await db.collection(COL.images).doc(slot).set({ url, updatedAt: Date.now() }, { merge: true });
  return json({ slot, url });
}
