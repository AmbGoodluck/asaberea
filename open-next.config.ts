import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

// Runs Next.js on Cloudflare Workers with Node.js compatibility, so the
// Firestore REST client in the /api routes works. See CLOUDFLARE_DEPLOY.md.
//
// The incremental cache stores prerendered / ISR pages in R2 (bucket
// `asaberea-cache`, binding NEXT_INC_CACHE_R2_BUCKET) with a per-region
// Cache-API layer in front. `enableCacheInterception` serves those cached
// pages straight from the fetch handler without booting the full Next.js
// renderer, which keeps CPU well under the Workers limit (fixes Error 1102).
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
  enableCacheInterception: true,
});
