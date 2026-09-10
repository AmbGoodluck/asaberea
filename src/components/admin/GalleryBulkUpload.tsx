"use client";

import { useRef, useState } from "react";
import { useAdmin } from "./AdminProvider";
import { compressImage, runPool } from "@/lib/image-compress";

const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB accepted (compressed well below on upload)

function captionFromName(name: string): string {
  return name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

export default function GalleryBulkUpload({ onDone }: { onDone: () => void }) {
  const { authedFetch } = useAdmin();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [notes, setNotes] = useState<string[]>([]);

  async function handleFiles(fileList: FileList) {
    const all = Array.from(fileList);
    const valid = all.filter((f) => OK_TYPES.includes(f.type) && f.size <= MAX_BYTES);
    const skipped = all.length - valid.length;

    if (valid.length === 0) {
      setNotes(["No usable images. Use JPG, PNG, WebP, GIF, or AVIF, each under 25 MB."]);
      return;
    }

    setBusy(true);
    setNotes([]);
    let done = 0;
    setProgress({ done: 0, total: valid.length });
    const failed: string[] = [];

    // Compress + upload up to 4 at a time.
    await runPool(valid, 4, async (f, i) => {
      try {
        const { file, w, h, blur } = await compressImage(f);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("caption", captionFromName(f.name));
        fd.append("order", String(200 + i));
        if (w && h) {
          fd.append("w", String(w));
          fd.append("h", String(h));
        }
        if (blur) fd.append("blur", blur);
        const res = await authedFetch("/api/admin/gallery", { method: "POST", body: fd });
        if (!res.ok) failed.push(f.name);
      } catch {
        failed.push(f.name);
      }
      done += 1;
      setProgress({ done, total: valid.length });
    });

    setBusy(false);
    setProgress(null);

    const msgs: string[] = [];
    const ok = valid.length - failed.length;
    if (ok > 0) msgs.push(`Added ${ok} photo${ok === 1 ? "" : "s"}.`);
    if (skipped > 0) msgs.push(`${skipped} skipped (wrong type or over 25 MB).`);
    if (failed.length > 0)
      msgs.push(
        `${failed.length} failed: ${failed.slice(0, 6).join(", ")}${failed.length > 6 ? "..." : ""}`
      );
    setNotes(msgs);
    onDone();
  }

  return (
    <div className="a-card" style={{ marginBottom: 26 }}>
      <h3>Add multiple gallery photos</h3>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 14px", lineHeight: 1.55 }}>
        Pick several images at once. They are compressed in your browser before
        upload, so even big phone photos go up fast. Captions default to the file
        name and can be edited in the list below.
      </p>
      <div className="a-form-actions">
        <button
          className="a-btn primary"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy && progress
            ? `Uploading ${progress.done} of ${progress.total}...`
            : "Choose images"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={OK_TYPES.join(",")}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files && e.target.files.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {notes.map((m, i) => (
        <div key={i} className="a-msg" style={{ display: "block", marginTop: 10 }}>
          {m}
        </div>
      ))}
    </div>
  );
}
