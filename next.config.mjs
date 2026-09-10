/** @type {import('next').NextConfig} */

// Content Security Policy. Scoped to what the site actually loads:
// Next.js runtime, Google Fonts, and Firebase (Auth popup, Firestore, Storage).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self' https://berea.campusgroups.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.googleusercontent.com https://firebasestorage.googleapis.com https://*.gstatic.com",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com",
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://apis.google.com",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // This project is the tracing root even if a lockfile exists in a parent dir.
  outputFileTracingRoot: import.meta.dirname,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

// Cloudflare (OpenNext) local-dev integration. No-op during a normal Node
// build/deploy; lets `next dev` see Cloudflare bindings. See CLOUDFLARE_DEPLOY.md.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
