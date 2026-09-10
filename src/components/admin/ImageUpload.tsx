"use client";

import { useRef, useState } from "react";
import { useAdmin } from "./AdminProvider";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export default function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}) {
  const { authedFetch } = useAdmin();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setErr(null);
    if (!OK_TYPES.includes(file.type)) {
      setErr("Use a JPG, PNG, WebP, GIF, or AVIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErr("Image must be under 8 MB.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await authedFetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        setErr("Upload failed. Check your admin access and try again.");
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) onChange(data.url);
      else setErr("Upload failed. Try again.");
    } catch {
      setErr("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="au">
      <div className="au-label">{label}</div>
      <div className="au-row">
        <div className="au-preview" style={value ? { backgroundImage: `url(${value})` } : undefined}>
          {!value && <span>No image</span>}
        </div>
        <div className="au-actions">
          <button type="button" className="a-btn" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Uploading..." : value ? "Replace" : "Upload"}
          </button>
          {value && (
            <button type="button" className="a-btn ghost" onClick={() => onChange("")}>
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={OK_TYPES.join(",")}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
      {err && <div className="au-err">{err}</div>}
    </div>
  );
}
