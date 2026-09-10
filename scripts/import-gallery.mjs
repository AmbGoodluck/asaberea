// Bulk-import event photos into the site gallery.
//
// Images are uploaded to the Cloudflare R2 bucket (via `wrangler r2 object put`,
// so it uses your existing `wrangler login`) and a `gallery` document is
// created in Firestore. Photos then show on /gallery and the homepage strip,
// served from /media/<key>.
//
// Prereq:
//   - `npx wrangler login` (once)
//   - FIREBASE_SERVICE_ACCOUNT in .env.local (see FIREBASE_SETUP.md), and the
//     Firestore database must exist.
//
// Usage:
//   # from a folder on your computer (recommended, handles subfolders):
//   npm run import-gallery -- ~/Downloads/eventsphotos
//
//   # from a PUBLIC Box shared link (only if it needs no sign-in):
//   npm run import-gallery -- --box https://berea.box.com/v/eventsphotos
//
// Options:
//   --dry                 list what would be imported, upload nothing
//   --prefix "Africa Week" caption prefix for every photo
//   --bucket NAME         R2 bucket (default: asaberea-media)

import { readFileSync } from "node:fs";
import { readdir, stat, readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const run = promisify(execFile);

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

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry");
const PREFIX = valueAfter("--prefix", "");
const BOX_URL = valueAfter("--box", null);
const BUCKET = valueAfter("--bucket", "asaberea-media");
const LOCAL_DIR = argv.find(
  (a, i) =>
    !a.startsWith("--") &&
    argv[i - 1] !== "--prefix" &&
    argv[i - 1] !== "--box" &&
    argv[i - 1] !== "--bucket"
);

function valueAfter(flag, dflt) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] ?? dflt : dflt;
}

const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

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

let TMP;

function caption(name, folder) {
  const base = name.replace(IMG_RE, "").replace(/[-_]+/g, " ").trim();
  const parts = [
    PREFIX,
    folder && folder !== "." ? folder.replace(/[-_/]+/g, " ").trim() : "",
    base,
  ].filter(Boolean);
  return parts.join(" · ").slice(0, 140);
}

function contentTypeFor(name) {
  const ext = name.split(".").pop().toLowerCase();
  return ext === "jpg" ? "image/jpeg" : `image/${ext}`;
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

async function putToR2(key, filePath, contentType) {
  await run("npx", [
    "wrangler",
    "r2",
    "object",
    "put",
    `${BUCKET}/${key}`,
    "--file",
    filePath,
    "--content-type",
    contentType,
    "--remote",
  ]);
}

async function importOne({ filePath, buffer, source, name, folder }, order, seen) {
  if (seen.has(source)) {
    console.log(`skip (already imported)  ${source}`);
    return false;
  }
  const cap = caption(name, folder);
  const key = `gallery/imported/${Date.now()}_${name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  if (DRY) {
    console.log(`would import  ${source}  ->  ${cap}`);
    return true;
  }
  let localPath = filePath;
  if (!localPath) {
    localPath = path.join(TMP, name.replace(/[^a-zA-Z0-9._-]/g, "_"));
    await writeFile(localPath, buffer);
  }
  await putToR2(key, localPath, contentTypeFor(name));
  await db.collection("gallery").add({
    caption: cap,
    imageUrl: "/media/" + key,
    order: 100 + order,
    createdAt: Date.now(),
    source,
  });
  console.log(`imported  ${source}  ->  /media/${key}`);
  return true;
}

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
    const ok = await importOne(
      { filePath: f.full, source: `local:${path.join(f.rel, f.name)}`, name: f.name, folder: f.rel },
      order++,
      seen
    );
    if (ok) done++;
  }
  console.log(`\n${DRY ? "(dry run) " : ""}${done} photo(s) processed.`);
}

async function boxGet(url, sharedLink) {
  const res = await fetch(url, { headers: { BoxApi: `shared_link=${sharedLink}` } });
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
      if (it.type === "folder") await boxListFolder(it.id, sharedLink, it.name, out);
      else if (it.type === "file" && IMG_RE.test(it.name))
        out.push({ id: it.id, name: it.name, folder: folderName });
    }
    offset += 200;
    if (offset >= (data.total_count || 0)) break;
  }
}

async function runBox(shareUrl) {
  console.log(
    "Box mode needs the link open to anyone (no sign-in, no password).\n" +
      "If it asks you to log in, change the share setting in Box, or download\n" +
      "the folder and use:  npm run import-gallery -- ~/Downloads/eventsphotos\n"
  );
  let root;
  try {
    root = await boxGet("https://api.box.com/2.0/shared_items", shareUrl);
  } catch (e) {
    console.error("\nCould not read the Box link anonymously: " + e.message);
    process.exit(1);
  }
  if (root.type !== "folder") {
    console.error("That link is not a folder.");
    process.exit(1);
  }
  const files = [];
  await boxListFolder(root.id, shareUrl, ".", files);
  console.log(`Found ${files.length} image(s) in Box.`);
  const seen = await existingSources();
  let order = 0;
  let done = 0;
  for (const f of files) {
    const dl = await fetch(`https://api.box.com/2.0/files/${f.id}/content`, {
      headers: { BoxApi: `shared_link=${shareUrl}` },
    });
    if (!dl.ok) {
      console.log(`skip (download ${dl.status})  ${f.name}`);
      continue;
    }
    const buffer = Buffer.from(await dl.arrayBuffer());
    const ok = await importOne(
      { buffer, source: `box:${f.id}`, name: f.name, folder: f.folder },
      order++,
      seen
    );
    if (ok) done++;
  }
  console.log(`\n${DRY ? "(dry run) " : ""}${done} photo(s) processed.`);
}

async function main() {
  TMP = await mkdtemp(path.join(os.tmpdir(), "asa-gallery-"));
  try {
    if (BOX_URL) await runBox(BOX_URL);
    else if (LOCAL_DIR) await runLocal(LOCAL_DIR);
    else {
      console.error(
        "Give a folder path or a Box link:\n" +
          "  npm run import-gallery -- ~/Downloads/eventsphotos\n" +
          "  npm run import-gallery -- --box https://berea.box.com/v/eventsphotos\n"
      );
      process.exit(1);
    }
  } finally {
    await rm(TMP, { recursive: true, force: true });
  }
  process.exit(0);
}
main();
