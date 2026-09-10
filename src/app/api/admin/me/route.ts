import { requireAdmin, json } from "@/lib/auth-guard";
import { adminEnabled } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!adminEnabled) return json({ admin: false, configured: false });
  const user = await requireAdmin(req);
  if (!user) return json({ admin: false, configured: true }, 200);
  return json({ admin: true, configured: true, email: user.email });
}
