import "server-only";
import { isAdminEmail, adminEnabled } from "./firebase/admin";
import { verifyFirebaseIdToken } from "./verify-token";
import { rateLimit, clientIp } from "./ratelimit";

export type AdminUser = { uid: string; email: string };

// Verifies the Firebase ID token from the Authorization header and confirms
// the email is on the admin allowlist. Returns null when unauthorized.
export async function requireAdmin(req: Request): Promise<AdminUser | null> {
  // Without the service account there is no Firestore to guard yet.
  if (!adminEnabled) return null;

  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  const user = await verifyFirebaseIdToken(token);
  if (!user || !user.email || !isAdminEmail(user.email)) return null;
  return { uid: user.uid, email: user.email };
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Per-IP rate limit for an API route. Returns a 429 Response when the caller
// is over the limit, or null to proceed. Default: 60 requests per minute.
export function guardRate(
  req: Request,
  bucket: string,
  limit = 60,
  windowMs = 60_000
): Response | null {
  const res = rateLimit(`${bucket}:${clientIp(req)}`, limit, windowMs);
  if (res.ok) return null;
  return new Response(
    JSON.stringify({ error: "rate_limited", retryAfter: res.retryAfter }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(res.retryAfter),
      },
    }
  );
}
