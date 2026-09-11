"use client";

import { useRef, useState } from "react";
import { useAdmin } from "./AdminProvider";
import { compressImage } from "@/lib/image-compress";

const MAX_BYTES = 25 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const DEFAULT_FOCAL = "50% 50%";

function parsePos(pos: string): { x: number; y: number } {
  const m = pos.match(/^(\d{1,3})%\s+(\d{1,3})%$/);
  return m ? { x: Number(m[1]), y: Number(m[2]) } : { x: 50, y: 50 };
}

// A wide preview with a click-to-set focal point, so a page image can be
// re-framed to whatever part of the photo matters, instead of always
// cropping dead-center.
export default function FocalImageUpload({
  label,
  hint,
  value,
  position,
  folder,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  position: string;
  folder: string;
  onChange: (next: { url: string; position: string }) => void;
}) {
  const { authedFetch } = useAdmin();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pos = parsePos(position || DEFAULT_FOCAL);

  async function handleFile(file: File) {
    setErr(null);
    if (!OK_TYPES.includes(file.type)) {
      setErr("Use a JPG, PNG, WebP, GIF, or AVIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErr("Image must be under 25 MB.");
      return;
    }
    setBusy(true);
    try {
      const { file: compressed } = await compressImage(file);
      const fd = new FormData();
      fd.append("file", compressed);
      fd.append("folder", folder);
      const res = await authedFetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        setErr("Upload failed. Check your admin access and try again.");
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) onChange({ url: data.url, position: DEFAULT_FOCAL });
      else setErr("Upload failed. Try again.");
    } catch {
      setErr("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function pickFocalPoint(e: React.MouseEvent<HTMLDivElement>) {
    if (!value) return;
    const box = previewRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    const clamp = (n: number) => Math.min(100, Math.max(0, n));
    onChange({ url: value, position: `${clamp(x)}% ${clamp(y)}%` });
  }

  return (
    <div className="fiu">
      <div className="au-label">{label}</div>
      {hint && <div className="fiu-hint">{hint}</div>}
      <div
        ref={previewRef}
        className={"fiu-preview" + (value ? " has-img clickable" : "")}
        style={
          value
            ? { backgroundImage: `url(${value})`, backgroundPosition: position || DEFAULT_FOCAL }
            : undefined
        }
        onClick={pickFocalPoint}
        role={value ? "button" : undefined}
        aria-label={value ? "Click to set what stays in view when cropped" : undefined}
      >
        {!value && <span>No image</span>}
        {value && (
          <span className="fiu-dot" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} aria-hidden />
        )}
      </div>
      <div className="fiu-actions">
        <button type="button" className="a-btn sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "Uploading..." : value ? "Replace" : "Upload"}
        </button>
        {value && (
          <>
            <button
              type="button"
              className="a-btn ghost sm"
              onClick={() => onChange({ url: value, position: DEFAULT_FOCAL })}
            >
              Reset framing
            </button>
            <button type="button" className="a-btn ghost sm" onClick={() => onChange({ url: "", position: DEFAULT_FOCAL })}>
              Remove
            </button>
          </>
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
      {err && <div className="au-err">{err}</div>}
    </div>
  );
}
