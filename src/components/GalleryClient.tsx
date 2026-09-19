"use client";

import { useCallback, useEffect, useState } from "react";
import { grad } from "@/lib/data";
import { pairFor } from "./cards";
import ShareStoryButton from "./ShareStoryButton";
import { frameFor, aspectCss } from "@/lib/gallery-frames";
import type { GalleryDoc } from "@/lib/firebase/schema";

function gradientFor(g: GalleryDoc) {
  const [a, b] = g.c1 && g.c2 ? [g.c1, g.c2] : pairFor(g.caption || g.id);
  return grad(a, b);
}

function GalleryTile({
  g,
  index,
  onOpen,
}: {
  g: GalleryDoc;
  index: number;
  onOpen: () => void;
}) {
  const hasImg = Boolean(g.imageUrl);
  // A fixed aspect ratio gives every tile a real height up front, so the
  // gallery lays out cleanly whether or not the image has loaded yet. No JS
  // measuring, no collapsed tiles.
  return (
    <div
      className="gtile"
      style={{ aspectRatio: aspectCss(frameFor(g, index)) }}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={g.caption ? `View: ${g.caption}` : "View photo"}
    >
      <span className="gframe">
        <span
          className="gblur"
          style={{
            backgroundImage: g.blur ? `url(${g.blur})` : undefined,
            background: g.blur ? undefined : gradientFor(g),
          }}
          aria-hidden
        />
        {hasImg ? (
          <img src={g.imageUrl} alt={g.caption || ""} loading="lazy" decoding="async" />
        ) : (
          <span className="gph">
            <span className="grain" style={{ opacity: 0.4 }} />
          </span>
        )}
        <span className="gsheen" aria-hidden />
        {hasImg && <ShareStoryButton imageUrl={g.imageUrl} caption={g.caption} variant="tile" />}
      </span>
      {g.caption ? <span className="cap">{g.caption}</span> : null}
    </div>
  );
}

export default function GalleryClient({ items }: { items: GalleryDoc[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (dir: number) =>
      setActive((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, step]);

  const current = active !== null ? items[active] : null;

  return (
    <>
      <div className="masonry">
        {items.map((g, i) => (
          <GalleryTile key={g.id} g={g} index={i} onOpen={() => setActive(i)} />
        ))}
      </div>

      {current && (
        <div className="lightbox" onClick={close}>
          <button className="lx" aria-label="Close" onClick={close}>
            &times;
          </button>
          {items.length > 1 && (
            <>
              <button
                className="lnav prev"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
              >
                &#8249;
              </button>
              <button
                className="lnav next"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
              >
                &#8250;
              </button>
            </>
          )}
          <figure className="lbox" onClick={(e) => e.stopPropagation()}>
            {current.imageUrl ? (
              <img src={current.imageUrl} alt={current.caption || ""} />
            ) : (
              <div
                className="lph"
                style={{
                  background: gradientFor(current),
                  aspectRatio: aspectCss(frameFor(current, active ?? 0)),
                }}
              />
            )}
            <figcaption className="lcap">
              {current.caption ? <span>{current.caption}</span> : <span />}
              {current.imageUrl && (
                <ShareStoryButton
                  imageUrl={current.imageUrl}
                  caption={current.caption}
                  variant="bar"
                />
              )}
            </figcaption>
          </figure>
          {items.length > 1 && (
            <div className="lcount">
              {active! + 1} / {items.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
