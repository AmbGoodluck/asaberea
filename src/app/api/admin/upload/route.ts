import { requireAdmin, json, guardRate } from "@/lib/auth-guard";
import {
  mediaBucket,
  mediaUrl,
  safeKeySegment,
  MAX_UPLOAD_BYTES,
  OK_IMAGE_TYPES,
} from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/upload  (multipart: file, folder?)  -> { url }
// Admin only. Stores the image in the R2 bucket and returns the /media path.
export async function POST(req: Request) {
  const limited = guardRate(req, "admin-upload", 60, 60_000);
  if (limited) return limited;
  const user = await requireAdmin(req);
  if (!user) return json({ error: "unauthorized" }, 401);

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

  const folderRaw = String(form.get("folder") || "uploads");
  const folder = folderRaw
    .split("/")
    .map((s) => s.replace(/[^a-zA-Z0-9._-]/g, "_"))
    .filter(Boolean)
    .slice(0, 3)
    .join("/") || "uploads";

  const key = `${folder}/${Date.now()}_${safeKeySegment(file.name || "image")}`;
  const bytes = await file.arrayBuffer();

  await bucket.put(key, bytes, {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return json({ url: mediaUrl(key), key }, 201);
}
