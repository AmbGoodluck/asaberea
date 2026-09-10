// Bulk-import event photos into the site gallery.
//
// It uploads each image to Firebase Storage and creates a `gallery` document
// in Firestore, so the photos show on /gallery and the homepage strip.
//
// Prereq: FIREBASE_SERVICE_ACCOUNT and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in
// .env.local (see FIREBASE_SETUP.md).
//
// Usage:
//   # from a folder on your computer (recommended, handles subfolders):
//   npm run import-gallery -- ~/Downloads/eventsphotos
//
//   # from a PUBLIC Box shared link (only works if the link needs no sign-in):
//   npm run import-gallery -- --box https://berea.box.com/v/eventsphotos
//
// Options:
//   --dry     list what would be imported, upload nothing
//   --prefix "Africa Week"   caption prefix for every photo

import { readFileSync } from "node:fs";
import { readdir, stat, readFile } from "node:fs/promises";
import path from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// ---- env ----
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

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const prefixIdx = args.indexOf("--prefix");
const PREFIX = prefixIdx >= 0 ? args[prefixIdx + 1] || "" : "";
const boxIdx = args.indexOf("--box");
const BOX_URL = boxIdx >= 0 ? args[boxIdx + 1] : null;
const LOCAL_DIR = args.find((a) => !a.startsWith("--") && a !== PREFIX && a !== BOX_URL);

const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (!raw) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT in .env.local");
  process.exit(1);
}
if (!bucketName) {
  console.error("Missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env.local");
  process.exit(1);
}
const serviceAccount = JSON.parse(
  raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")
);

initializeApp({ credential: cert(serviceAccount), storageBucket: bucketName });
const db = getFirestore();
db.settings({ preferRest: true });
const bucket = getStorage().bucket();

function caption(name, folder) {
  const base = name.replace(IMG_RE, "").replace(/[-_]+/g, " ").trim();
  const parts = [PREFIX, folder && folder !== "." ? folder.replace(/[-_/]+/g, " ").trim() : "", base].filter(Boolean);
  // De-duplicate repeated words, keep it short.
  return parts.join(" · ").slice(0, 140);
}

function publicUrl(dest) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(dest)}?alt=media`;
}

async function existingSources() {
  const snap = await db.collection("gallery").get();
  const set = new Set();
  snap.forEach((d) => {
    const s = d.data().source;
    if (s) set.add(s);
  });
  return set;
}

async function importOne({ buffer, source, name, folder, contentType }, order, seen) {
  if (seen.has(source)) {
    console.log(`skip (already imported)  ${source}`);
    return false;
  }
  const dest = `gallery/imported/${Date.now()}_${name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  if (DRY) {
    console.log(`would import  ${source}  ->  ${caption(name, folder)}`);
    return true;
  }
  await bucket.file(dest).save(buffer, {
    contentType: contentType || "image/jpeg",
    resumable: false,
    metadata: { cacheControl: "public,max-age=31536000,immutable" },
  });
  await db.collection("gallery").add({
    caption: caption(name, folder),
    imageUrl: publicUrl(dest),
    order: 100 + order,
    createdAt: Date.now(),
    source,
  });
  console.log(`imported  ${source}`);
  return true;
}

// ---- local folder walk ----
async function* walk(dir, rel = ".") {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const r = path.join(rel, e.name);
    if (e.isDirectory()) yield* walk(full, r);
    else if (IMG_RE.test(e.name)) yield { full, rel: path.dirname(r), name: e.name };
  }
}

async function runLocal(dir) {
  const s = await stat(dir).catch(() => null);
  if (!s || !s.isDirectory()) {
    console.error(`Not a folder: ${dir}`);
    process.exit(1);
  }
  const seen = await existingSources();
  let order = 0;
  let done = 0;
  for await (const f of walk(dir)) {
    const buffer = await readFile(f.full);
    const ext = f.name.split(".").pop().toLowerCase();
    const contentType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    const ok = await importOne(
      { buffer, source: `local:${path.join(f.rel, f.name)}`, name: f.name, folder: f.rel, contentType },
      order++,
      seen
    );
    if (ok) done++;
  }
  console.log(`\n${DRY ? "(dry run) " : ""}${done} photo(s) processed.`);
}

// ---- Box public shared link ----
async function boxGet(url, sharedLink) {
  const res = await fetch(url, {
    headers: { BoxApi: `shared_link=${sharedLink}` },
  });
  if (!res.ok) throw new Error(`Box ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function boxListFolder(folderId, sharedLink, folderName, out) {
  let offset = 0;
  for (;;) {
    const data = await boxGet(
      `https://api.box.com/2.0/folders/${folderId}/items?limit=200&offset=${offset}&fields=id,name,type`,
      sharedLink
    );
    for (const it of data.entries || []) {
      if (it.type === "folder") {
        await boxListFolder(it.id, sharedLink, it.name, out);
      } else if (it.type === "file" && IMG_RE.test(it.name)) {
        out.push({ id: it.id, name: it.name, folder: folderName });
      }
    }
    offset += 200;
    if (offset >= (data.total_count || 0)) break;
  }
}

async function runBox(shareUrl) {
  console.log(
    "Box mode needs the link to be open to anyone (no sign-in, no password).\n" +
      "If it asks you to log in, change the share setting in Box, or use the\n" +
      "local-folder mode instead: download the folder, then\n" +
      "  npm run import-gallery -- ~/Downloads/eventsphotos\n"
  );
  const sharedLink = shareUrl;
  let root;
  try {
    root = await boxGet("https://api.box.com/2.0/shared_items", sharedLink);
  } catch (e) {
    console.error("\nCould not read the Box link anonymously: " + e.message);
    process.exit(1);
  }
  if (root.type !== "folder") {
    console.error("That link is not a folder.");
    process.exit(1);
  }
  const files = [];
  await boxListFolder(root.id, sharedLink, ".", files);
  console.log(`Found ${files.length} image(s) in Box.`);
  const seen = await existingSources();
  let order = 0;
  let done = 0;
  for (const f of files) {
    const dl = await fetch(
      `https://api.box.com/2.0/files/${f.id}/content`,
      { headers: { BoxApi: `shared_link=${sharedLink}` } }
    );
    if (!dl.ok) {
      console.log(`skip (download ${dl.status})  ${f.name}`);
      continue;
    }
    const buffer = Buffer.from(await dl.arrayBuffer());
    const ext = f.name.split(".").pop().toLowerCase();
    const contentType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    const ok = await importOne(
      { buffer, source: `box:${f.id}`, name: f.name, folder: f.folder, contentType },
      order++,
      seen
    );
    if (ok) done++;
  }
  console.log(`\n${DRY ? "(dry run) " : ""}${done} photo(s) processed.`);
}

if (BOX_URL) {
  await runBox(BOX_URL);
} else if (LOCAL_DIR) {
  await runLocal(LOCAL_DIR);
} else {
  console.error(
    "Give a folder path or a Box link:\n" +
      "  npm run import-gallery -- ~/Downloads/eventsphotos\n" +
      "  npm run import-gallery -- --box https://berea.box.com/v/eventsphotos\n"
  );
  process.exit(1);
}
process.exit(0);
