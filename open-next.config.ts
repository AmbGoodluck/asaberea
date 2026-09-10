import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Runs Next.js on Cloudflare Workers with Node.js compatibility, so the
// Firebase Admin SDK in the /api routes works. See CLOUDFLARE_DEPLOY.md.
export default defineCloudflareConfig();
