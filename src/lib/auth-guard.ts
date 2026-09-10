import "server-only";
import { adminAuth, isAdminEmail } from "./firebase/admin";

export type AdminUser = { uid: string; email: string };

// Verifies the Firebase ID token from the Authorization header and confirms
// the email is on the admin allowlist. Returns null when unauthorized.
export async function requireAdmin(req: Request): Promise<AdminUser | null> {
  const auth = adminAuth();
  if (!auth) return null;

  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  try {
    const decoded = await auth.verifyIdToken(token, true);
    const email = decoded.email || "";
    if (!isAdminEmail(email)) return null;
    return { uid: decoded.uid, email };
  } catch {
    return null;
  }
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
