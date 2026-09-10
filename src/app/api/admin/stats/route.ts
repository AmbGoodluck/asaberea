import { requireAdmin, json, guardRate } from "@/lib/auth-guard";
import { adminDb } from "@/lib/firebase/admin";
import { statsInput, COL, STATS_DOC } from "@/lib/firebase/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limited = guardRate(req, "admin-read", 120, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = adminDb();
  if (!db) return json({ error: "not_configured" }, 503);
  const doc = await db.collection(COL.stats).doc(STATS_DOC).get();
  return json(doc.exists ? doc.data() : { nations: 9, eventsPerYear: 24, ecLeaders: 10, joinPrice: 6 });
}

export async function PUT(req: Request) {
  const limited = guardRate(req, "admin-write", 40, 60_000);
  if (limited) return limited;
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
  // Coerce numeric strings from form inputs.
  const raw = (body ?? {}) as Record<string, unknown>;
  const coerced = {
    nations: Number(raw.nations),
    eventsPerYear: Number(raw.eventsPerYear),
    ecLeaders: Number(raw.ecLeaders),
    joinPrice: Number(raw.joinPrice),
  };
  const parsed = statsInput.safeParse(coerced);
  if (!parsed.success) return json({ error: "invalid", issues: parsed.error.flatten() }, 422);

  await db.collection(COL.stats).doc(STATS_DOC).set(parsed.data, { merge: true });
  return json(parsed.data);
}
