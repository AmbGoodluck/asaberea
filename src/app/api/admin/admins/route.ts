import { requireAdmin, json, guardRate } from "@/lib/auth-guard";
import { fdb } from "@/lib/firestore-rest";
import { ownerEmails, isOwnerEmail } from "@/lib/firebase/admin";
import { sanitizeObject } from "@/lib/sanitize";
import { adminInput, COL } from "@/lib/firebase/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/admins -> owners (from env, permanent) + added admins (Firestore)
export async function GET(req: Request) {
  const limited = guardRate(req, "admin-read", 120, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!fdb.enabled) return json({ error: "not_configured" }, 503);

  const added = (await fdb.list(COL.admins)) || [];
  added.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  return json({
    owners: ownerEmails(),
    admins: added,
    you: { email: user.email, owner: user.owner },
  });
}

// POST /api/admin/admins -> add an email to the allowlist
export async function POST(req: Request) {
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
  const clean = sanitizeObject((body ?? {}) as Record<string, unknown>);
  const parsed = adminInput.safeParse(clean);
  if (!parsed.success) return json({ error: "invalid", issues: parsed.error.flatten() }, 422);

  const { email, role } = parsed.data;
  if (isOwnerEmail(email)) {
    return json({ error: "already_owner", message: "That email is already a permanent owner." }, 409);
  }
  const existing = await fdb.get(COL.admins, email);
  if (existing) {
    return json({ error: "already_admin", message: "That email is already an admin." }, 409);
  }

  const doc = { email, role, addedBy: user.email, createdAt: Date.now() };
  const ok = await fdb.set(COL.admins, email, doc);
  if (!ok) return json({ error: "write_failed" }, 502);
  return json({ id: email, ...doc }, 201);
}

// DELETE /api/admin/admins?email=... -> remove an added admin
export async function DELETE(req: Request) {
  const limited = guardRate(req, "admin-write", 40, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!fdb.enabled) return json({ error: "not_configured" }, 503);

  const url = new URL(req.url);
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();
  if (!email) return json({ error: "missing_email" }, 400);
  if (isOwnerEmail(email)) {
    return json({ error: "owner_protected", message: "Owners are set in the site config and cannot be removed here." }, 409);
  }

  const ok = await fdb.del(COL.admins, email);
  if (!ok) return json({ error: "delete_failed" }, 502);
  return json({ ok: true });
}
