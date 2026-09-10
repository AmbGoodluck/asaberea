import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Access to the R2 bucket bound as MEDIA in wrangler.jsonc. Returns null when
// the binding is not available (e.g. during a plain `next build`).
export function mediaBucket(): R2Bucket | null {
  try {
    const { env } = getCloudflareContext();
    return (env as unknown as { MEDIA?: R2Bucket }).MEDIA ?? null;
  } catch {
    return null;
  }
}

// Public path the site serves an object at. Kept relative so it works on any
// domain and satisfies the `img-src 'self'` CSP.
export function mediaUrl(key: string): string {
  return "/media/" + key.split("/").map(encodeURIComponent).join("/");
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const OK_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export function safeKeySegment(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}
