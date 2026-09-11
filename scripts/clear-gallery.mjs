// Deletes every photo in the gallery: the Firestore docs and their R2
// objects (via `wrangler r2 object delete`, so it uses your `wrangler login`).
//
// Usage:
//   npm run clear-gallery            # delete everything
//   npm run clear-gallery -- --dry   # just list what would be deleted

import { readFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const run = promisify(execFile);
const DRY = process.argv.includes("--dry");
const BUCKET = "asaberea-media";

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
const serviceAccount = JSON.parse(
  raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")
);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
db.settings({ preferRest: true });

const snap = await db.collection("gallery").get();
if (snap.empty) {
  console.log("Gallery is already empty.");
  process.exit(0);
}

console.log(`${snap.size} gallery item(s) found.`);
let deleted = 0;
for (const doc of snap.docs) {
  const data = doc.data();
  const url = data.imageUrl || "";
  const key = url.startsWith("/media/") ? url.slice("/media/".length) : null;

  if (DRY) {
    console.log(`would delete  ${doc.id}  ${data.caption || ""}  ${key || "(no R2 object)"}`);
    continue;
  }

  if (key) {
    try {
      await run("npx", ["wrangler", "r2", "object", "delete", `${BUCKET}/${key}`, "--remote"]);
    } catch (e) {
      console.warn(`  R2 delete failed for ${key}: ${e.message?.split("\n")[0]}`);
    }
  }
  await doc.ref.delete();
  deleted++;
  console.log(`deleted  ${doc.id}  ${data.caption || ""}`);
}

console.log(`\n${DRY ? "(dry run) " : ""}${DRY ? snap.size : deleted} item(s) processed.`);
process.exit(0);
