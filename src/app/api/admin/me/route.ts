import { requireAdmin, json, guardRate } from "@/lib/auth-guard";
import { adminEnabled } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limited = guardRate(req, "admin-me", 60, 60_000);
  if (limited) return limited;
  if (!adminEnabled) return json({ admin: false, configured: false });
  const user = await requireAdmin(req);
  if (!user) return json({ admin: false, configured: true }, 200);
  return json({ admin: true, configured: true, email: user.email });
}
