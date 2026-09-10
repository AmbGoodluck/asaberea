"use client";

import { useRef, useState } from "react";
import { useAdmin } from "./AdminProvider";

const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

function captionFromName(name: string): string {
  return name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

// Natural pixel size, so the gallery can reserve space and avoid layout shift.
function imageSize(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ w: 0, h: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
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
      setNotes(["No usable images. Use JPG, PNG, WebP, GIF, or AVIF, each under 20 MB."]);
      return;
    }

    setBusy(true);
    setNotes([]);
    setProgress({ done: 0, total: valid.length });
    const failed: string[] = [];

    for (let i = 0; i < valid.length; i++) {
      const f = valid[i];
      try {
        const { w, h } = await imageSize(f);
        const fd = new FormData();
        fd.append("file", f);
        fd.append("caption", captionFromName(f.name));
        fd.append("order", String(200 + i));
        if (w && h) {
          fd.append("w", String(w));
          fd.append("h", String(h));
        }
        const res = await authedFetch("/api/admin/gallery", { method: "POST", body: fd });
        if (!res.ok) failed.push(f.name);
      } catch {
        failed.push(f.name);
      }
      setProgress({ done: i + 1, total: valid.length });
    }

    setBusy(false);
    setProgress(null);

    const msgs: string[] = [];
    const ok = valid.length - failed.length;
    if (ok > 0) msgs.push(`Added ${ok} photo${ok === 1 ? "" : "s"}.`);
    if (skipped > 0) msgs.push(`${skipped} skipped (wrong type or over 20 MB).`);
    if (failed.length > 0) msgs.push(`${failed.length} failed: ${failed.slice(0, 6).join(", ")}${failed.length > 6 ? "..." : ""}`);
    setNotes(msgs);
    onDone();
  }

  return (
    <div className="a-card" style={{ marginBottom: 26 }}>
      <h3>Add multiple gallery photos</h3>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 14px", lineHeight: 1.55 }}>
        Pick several images at once. Each becomes a gallery item; the caption
        defaults to the file name and can be edited in the list below.
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
