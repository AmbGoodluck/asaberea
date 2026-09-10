import { mediaBucket } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /media/<key>  -> streams the object from the R2 bucket.
// Public read; uploads are admin-only (see /api/admin/upload).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = (path || []).map(decodeURIComponent).join("/");
  if (!key || key.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const bucket = mediaBucket();
  if (!bucket) return new Response("Not configured", { status: 503 });

  const obj = await bucket.get(key);
  if (!obj || !obj.body) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  if (!headers.has("cache-control")) {
    headers.set("cache-control", "public, max-age=31536000, immutable");
  }
  return new Response(obj.body as ReadableStream, { headers });
}
