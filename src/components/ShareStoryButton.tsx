"use client";

import { useState } from "react";
import { buildStoryCard } from "@/lib/story-card";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/links";

type State = "idle" | "working" | "shared" | "saved" | "error";

export default function ShareStoryButton({
  imageUrl,
  caption,
  variant = "tile",
}: {
  imageUrl: string;
  caption?: string;
  variant?: "tile" | "bar";
}) {
  const [state, setState] = useState<State>("idle");

  async function share(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (state === "working") return;
    setState("working");
    try {
      const blob = await buildStoryCard({
        imageUrl,
        caption,
        handle: INSTAGRAM_HANDLE,
        logoUrl: "/logo.png",
      });
      const file = new File([blob], "asa-berea-story.png", { type: "image/png" });

      const nav = navigator as Navigator & {
        canShare?: (d: ShareData) => boolean;
      };
      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        await nav.share({
          files: [file],
          title: "African Students Association",
          text: `${caption ? caption + " " : ""}${INSTAGRAM_HANDLE}`,
        });
        setState("shared");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "asa-berea-story.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setState("saved");
      }
    } catch {
      setState("error");
    } finally {
      setTimeout(() => setState("idle"), 4000);
    }
  }

  const label =
    state === "working"
      ? "Preparing..."
      : state === "shared"
      ? "Shared"
      : state === "saved"
      ? "Saved to device"
      : state === "error"
      ? "Try again"
      : "Share to story";

  return (
    <span className={"share-story " + variant}>
      <button
        type="button"
        className="share-story-btn"
        onClick={share}
        aria-label="Share this photo to your Instagram story"
        title="Share to Instagram story"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
        <span>{label}</span>
      </button>
      {state === "saved" && (
        <a className="share-story-hint" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
          Open Instagram, add it to your story
        </a>
      )}
    </span>
  );
}
