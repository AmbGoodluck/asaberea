// Grants the Firebase custom claim { admin: true } to every email in
// ADMIN_EMAILS, so Storage/Firestore rules can trust request.auth.token.admin.
//
// Usage:
//   1) Put FIREBASE_SERVICE_ACCOUNT and ADMIN_EMAILS in .env.local
//   2) The listed people must have signed in to /admin at least once
//      (so their Firebase user exists).
//   3) Run:  npm run set-admins
//
// Re-run any time you add a new admin email.

import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function loadEnv() {
  try {
    const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}
loadEnv();

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT in .env.local");
  process.exit(1);
}
const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
const serviceAccount = JSON.parse(json);

const emails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

if (!emails.length) {
  console.error("No ADMIN_EMAILS set.");
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();

for (const email of emails) {
  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`granted admin to ${email}`);
  } catch (e) {
    console.warn(`skip ${email}: ${e.code || e.message} (have they signed in yet?)`);
  }
}
console.log("done");
process.exit(0);
