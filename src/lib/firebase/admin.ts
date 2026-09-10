// Firebase Admin SDK (server only). Never import this into a client component.
import "server-only";
import {
  getApps,
  initializeApp,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    // Accept either raw JSON or base64-encoded JSON.
    const json = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const serviceAccount = parseServiceAccount();
export const adminEnabled = Boolean(serviceAccount);

let app: App | null = null;
function getAdminApp(): App | null {
  if (!adminEnabled) return null;
  if (!app) {
    app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert(serviceAccount),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
  }
  return app;
}

export function adminAuth(): Auth | null {
  const a = getAdminApp();
  return a ? getAuth(a) : null;
}
export function adminDb(): Firestore | null {
  const a = getAdminApp();
  return a ? getFirestore(a) : null;
}

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
