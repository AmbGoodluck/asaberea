import { requireAdmin, json, guardRate } from "@/lib/auth-guard";
import { fdb } from "@/lib/firestore-rest";
import { sanitizeText } from "@/lib/sanitize";
import { COL } from "@/lib/firebase/schema";
import {
  mediaBucket,
  mediaUrl,
  safeKeySegment,
  MAX_UPLOAD_BYTES,
  OK_IMAGE_TYPES,
} from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/gallery  (multipart: file, caption?, order?)
// One call = one photo: stores it in R2 and creates the gallery document.
// Used by the "add multiple photos" flow, which loops over this per file.
export async function POST(req: Request) {
  const limited = guardRate(req, "gallery-add", 300, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!fdb.enabled) return json({ error: "not_configured" }, 503);

  const bucket = mediaBucket();
  if (!bucket) return json({ error: "no_bucket" }, 503);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "bad_form" }, 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "no_file" }, 400);
  if (!OK_IMAGE_TYPES.includes(file.type)) return json({ error: "bad_type" }, 415);
  if (file.size > MAX_UPLOAD_BYTES) return json({ error: "too_large" }, 413);

  const caption = sanitizeText(form.get("caption"), 160);
  const orderRaw = Number(form.get("order"));
  const order = Number.isFinite(orderRaw) ? Math.max(0, Math.min(9999, orderRaw)) : 100;

  const key = `gallery/${Date.now()}_${safeKeySegment(file.name || "photo")}`;
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  const url = mediaUrl(key);
  const saved = await fdb.add(COL.gallery, {
    caption,
    imageUrl: url,
    order,
    createdAt: Date.now(),
  });
  if (!saved) return json({ error: "write_failed", url }, 502);

  return json({ id: saved.id, url, caption, order }, 201);
}
