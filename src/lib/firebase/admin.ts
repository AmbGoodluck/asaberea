// Server-only Firebase helpers. We do NOT use the firebase-admin SDK here: it
// bundles protobuf.js (needs eval) and does not run on Cloudflare Workers.
// Firestore access goes through lib/firestore-rest.ts (REST + a jose-signed
// OAuth token). ID tokens are verified in lib/verify-token.ts.
import "server-only";
import { fdb, firestoreEnabled } from "../firestore-rest";
import { COL } from "./schema";

export { fdb };

// True once the service-account credential is present.
export const adminEnabled = firestoreEnabled;

// ---- Owners: the permanent allowlist from the environment ----
// These accounts always have access and can never be removed from the portal,
// so there is always a way back in. e.g. ADMIN_EMAILS="a@x.com,b@y.com"
export function ownerEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return ownerEmails().includes(email.toLowerCase());
}

// Back-compat name: env-only check (owners). Kept so older imports still work.
export function isAdminEmail(email?: string | null): boolean {
  return isOwnerEmail(email);
}
// Back-compat alias for the old function name.
export const adminEmails = ownerEmails;

// ---- Added admins: a Firestore-backed list managed from the portal ----
// An owner (or any existing admin) can add someone's email here (e.g. the
// president) and they can sign in and manage the site, without a redeploy.
export async function addedAdminEmails(): Promise<string[]> {
  const docs = await fdb.list(COL.admins);
  if (!docs) return [];
  const out: string[] = [];
  for (const d of docs) {
    const email = typeof d.email === "string" ? d.email.toLowerCase() : "";
    if (email) out.push(email);
  }
  return out;
}

// The real gate: an owner (env) OR an email added through the portal.
// Owners are checked first so access never depends on a Firestore read.
export async function isAllowedAdmin(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const e = email.toLowerCase();
  if (ownerEmails().includes(e)) return true;
  return (await addedAdminEmails()).includes(e);
}
