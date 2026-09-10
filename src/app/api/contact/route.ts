import { json } from "@/lib/auth-guard";
import { adminDb, adminEnabled } from "@/lib/firebase/admin";
import { contactInput, COL } from "@/lib/firebase/schema";
import { sanitizeObject } from "@/lib/sanitize";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public endpoint. Rate limited, sanitized, validated, stored in the inbox.
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit("contact:" + ip, 5, 10 * 60 * 1000); // 5 per 10 min
  if (!limit.ok) {
    return new Response(
      JSON.stringify({ error: "rate_limited", retryAfter: limit.retryAfter }),
      { status: 429, headers: { "content-type": "application/json", "retry-after": String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }

  // Honeypot: bots fill hidden fields. Silently accept, do not store.
  if ((body as { website?: string })?.website) return json({ ok: true });

  const clean = sanitizeObject((body ?? {}) as Record<string, unknown>);
  const parsed = contactInput.safeParse(clean);
  if (!parsed.success) return json({ error: "invalid", issues: parsed.error.flatten() }, 422);

  if (!adminEnabled) {
    // No backend yet: accept so the UI works during the demo, but do not persist.
    return json({ ok: true, stored: false });
  }
  const db = adminDb();
  if (!db) return json({ ok: true, stored: false });

  await db.collection(COL.contacts).add({
    ...parsed.data,
    read: false,
    createdAt: Date.now(),
    ip,
  });
  return json({ ok: true, stored: true }, 201);
}
