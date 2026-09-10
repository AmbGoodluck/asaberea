// Server-only Firebase helpers. We do NOT use the firebase-admin SDK here: it
// bundles protobuf.js (needs eval) and does not run on Cloudflare Workers.
// Firestore access goes through lib/firestore-rest.ts (REST + a jose-signed
// OAuth token). ID tokens are verified in lib/verify-token.ts.
import "server-only";
import { fdb, firestoreEnabled } from "../firestore-rest";

export { fdb };

// True once the service-account credential is present.
export const adminEnabled = firestoreEnabled;

// Comma-separated allowlist, lower-cased. e.g. ADMIN_EMAILS="a@x.com,b@y.com"
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}
