import { getCloudflareContext } from "@opennextjs/cloudflare";
import { mediaBucket } from "@/lib/media";

export const runtime = "nodejs";

// GET /media/<key>  -> serves the object from the R2 bucket.
// Repeat hits are served from the Cloudflare colo cache without touching R2
// or running any heavy code, so image-heavy pages barely load the Worker.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = (path || []).map(decodeURIComponent).join("/");
  if (!key || key.includes("..") || key.startsWith("/")) {
    return new Response("Not found", { status: 404 });
  }

  const edgeCache =
    typeof caches !== "undefined" && "default" in caches ? caches.default : null;
  const cacheKey = new URL(req.url).toString();

  if (edgeCache) {
    try {
      const hit = await edgeCache.match(cacheKey);
      if (hit) return hit;
    } catch {
      /* ignore cache read errors */
    }
  }

  const bucket = mediaBucket();
  if (!bucket) return new Response("Not configured", { status: 503 });

  const obj = await bucket.get(key);
  if (!obj) return new Response("Not found", { status: 404 });

  // Buffer the object (images are small) so we can both serve it and cache it
  // without teeing a stream, which can corrupt the cached entry.
  const body = await obj.arrayBuffer();

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  if (edgeCache) {
    try {
      getCloudflareContext().ctx.waitUntil(
        edgeCache.put(cacheKey, new Response(body.slice(0), { headers }))
      );
    } catch {
      /* no Cloudflare context (e.g. during build) */
    }
  }

  return new Response(body, { headers });
}
