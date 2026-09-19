"use client";

import { useEffect, useRef, useState } from "react";
import { useAdmin } from "./AdminProvider";
import { compressImage, runPool } from "@/lib/image-compress";
import { FRAME_OPTIONS, FRAME_ASPECT, autoFrameAt, aspectCss } from "@/lib/gallery-frames";
import type { GalleryFrame } from "@/lib/firebase/schema";

const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB accepted (compressed well below on upload)
const SUGGESTED = 10;

type Picked = { file: File; url: string; caption: string; frame: GalleryFrame };

function captionFromName(name: string): string {
  return name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function previewAspect(frame: GalleryFrame, index: number): string {
  const wh = frame === "auto" ? FRAME_ASPECT[autoFrameAt(index)] : FRAME_ASPECT[frame];
  return aspectCss(wh);
}

export default function GalleryBulkUpload({ onDone }: { onDone: () => void }) {
  const { authedFetch } = useAdmin();
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<Picked[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [notes, setNotes] = useState<string[]>([]);

  // Revoke object URLs when the list changes or the component unmounts.
  useEffect(() => {
    return () => picked.forEach((p) => URL.revokeObjectURL(p.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked]);

  function addFiles(fileList: FileList) {
    const all = Array.from(fileList);
    const valid = all.filter((f) => OK_TYPES.includes(f.type) && f.size <= MAX_BYTES);
    const skipped = all.length - valid.length;
    const next = valid.map<Picked>((file) => ({
      file,
      url: URL.createObjectURL(file),
      caption: captionFromName(file.name),
      frame: "auto",
    }));
    setPicked((prev) => [...prev, ...next]);
    setNotes(skipped > 0 ? [`${skipped} skipped (wrong type or over 25 MB).`] : []);
  }

  function update(i: number, patch: Partial<Picked>) {
    setPicked((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function removeAt(i: number) {
    setPicked((prev) => {
      const p = prev[i];
      if (p) URL.revokeObjectURL(p.url);
      return prev.filter((_, idx) => idx !== i);
    });
  }
  function clearAll() {
    picked.forEach((p) => URL.revokeObjectURL(p.url));
    setPicked([]);
    setNotes([]);
  }

  async function upload() {
    if (!picked.length) return;
    setBusy(true);
    setNotes([]);
    let done = 0;
    setProgress({ done: 0, total: picked.length });
    const failed: string[] = [];

    await runPool(picked, 4, async (p, i) => {
      try {
        const { file, w, h, blur } = await compressImage(p.file);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("caption", p.caption);
        fd.append("frame", p.frame);
        fd.append("order", String(200 + i));
        if (w && h) {
          fd.append("w", String(w));
          fd.append("h", String(h));
        }
        if (blur) fd.append("blur", blur);
        const res = await authedFetch("/api/admin/gallery", { method: "POST", body: fd });
        if (!res.ok) failed.push(p.file.name);
      } catch {
        failed.push(p.file.name);
      }
      done += 1;
      setProgress({ done, total: picked.length });
    });

    setBusy(false);
    setProgress(null);
    const ok = picked.length - failed.length;
    const msgs: string[] = [];
    if (ok > 0) msgs.push(`Added ${ok} photo${ok === 1 ? "" : "s"}.`);
    if (failed.length > 0)
      msgs.push(`${failed.length} failed: ${failed.slice(0, 6).join(", ")}${failed.length > 6 ? "..." : ""}`);
    setNotes(msgs);
    clearAll();
    onDone();
  }

  return (
    <div className="a-card" style={{ marginBottom: 26 }}>
      <h3>Add gallery photos</h3>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 14px", lineHeight: 1.55 }}>
        Pick up to {SUGGESTED} images at once, give each a caption, and choose a frame style so the
        gallery reads as a designed collage. Images are compressed in your browser before upload, so
        even big phone photos go up fast.
      </p>

      <div className="a-form-actions" style={{ marginBottom: picked.length ? 18 : 0 }}>
        <button className="a-btn primary" disabled={busy} onClick={() => inputRef.current?.click()}>
          {picked.length ? "Add more" : "Choose images"}
        </button>
        {picked.length > 0 && !busy && (
          <button className="a-btn ghost" onClick={clearAll}>Clear</button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={OK_TYPES.join(",")}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files && e.target.files.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {picked.length > 0 && (
        <>
          {picked.length > SUGGESTED && (
            <div className="a-msg" style={{ display: "block", marginBottom: 12 }}>
              You have {picked.length} selected. Ten at a time is the sweet spot, but they will all upload.
            </div>
          )}
          <div className="gup-grid">
            {picked.map((p, i) => (
              <div className="gup-item" key={p.url}>
                <div className="gup-thumb" style={{ aspectRatio: previewAspect(p.frame, i) }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" />
                  <button className="gup-x" aria-label="Remove" onClick={() => removeAt(i)} disabled={busy}>
                    &times;
                  </button>
                </div>
                <input
                  className="gup-cap"
                  value={p.caption}
                  maxLength={160}
                  placeholder="Caption"
                  onChange={(e) => update(i, { caption: e.target.value })}
                  disabled={busy}
                />
                <select
                  className="gup-frame"
                  value={p.frame}
                  onChange={(e) => update(i, { frame: e.target.value as GalleryFrame })}
                  disabled={busy}
                >
                  {FRAME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="a-form-actions" style={{ marginTop: 18 }}>
            <button className="a-btn primary" onClick={upload} disabled={busy}>
              {busy && progress
                ? `Uploading ${progress.done} of ${progress.total}...`
                : `Upload ${picked.length} photo${picked.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </>
      )}

      {notes.map((m, i) => (
        <div key={i} className="a-msg" style={{ display: "block", marginTop: 10 }}>{m}</div>
      ))}
    </div>
  );
}
