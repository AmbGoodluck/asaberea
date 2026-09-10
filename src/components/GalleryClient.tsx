"use client";

import { useCallback, useEffect, useState } from "react";
import { grad } from "@/lib/data";
import { pairFor } from "./cards";
import type { GalleryDoc } from "@/lib/firebase/schema";

function gradientFor(g: GalleryDoc) {
  const [a, b] = g.c1 && g.c2 ? [g.c1, g.c2] : pairFor(g.caption || g.id);
  return grad(a, b);
}

function GalleryTile({
  g,
  onOpen,
}: {
  g: GalleryDoc;
  onOpen: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const hasImg = Boolean(g.imageUrl);
  const sized = Boolean(g.w && g.h);
  // Reserve space so the masonry does not jump as images load.
  const ratioStyle = sized
    ? { aspectRatio: `${g.w} / ${g.h}` }
    : hasImg
    ? undefined
    : { aspectRatio: `1 / ${g.ratio || 1}` };

  return (
    <button
      className={
        "gtile" +
        (sized ? " sized" : "") +
        (loaded || !hasImg ? " ready" : "")
      }
      onClick={onOpen}
      aria-label={g.caption ? `View: ${g.caption}` : "View photo"}
    >
      <span className="gframe" style={ratioStyle}>
        {hasImg ? (
          <img
            src={g.imageUrl}
            alt={g.caption || ""}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <span className="gph" style={{ background: gradientFor(g) }}>
            <span className="grain" style={{ opacity: 0.4 }} />
          </span>
        )}
        <span className="gsheen" aria-hidden />
      </span>
      {g.caption ? <span className="cap">{g.caption}</span> : null}
    </button>
  );
}

export default function GalleryClient({ items }: { items: GalleryDoc[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (dir: number) => {
      setActive((i) => {
        if (i === null) return i;
        const n = items.length;
        return (i + dir + n) % n;
      });
    },
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
          <GalleryTile key={g.id} g={g} onOpen={() => setActive(i)} />
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
                  aspectRatio: `1 / ${current.ratio || 1}`,
                }}
              />
            )}
            {current.caption ? (
              <figcaption className="lcap">{current.caption}</figcaption>
            ) : null}
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
