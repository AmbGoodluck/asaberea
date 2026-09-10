"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { grad } from "@/lib/data";
import { pairFor } from "./cards";
import ShareStoryButton from "./ShareStoryButton";
import type { GalleryDoc } from "@/lib/firebase/schema";

const GAP = 16;
const ROW = 8;

function gradientFor(g: GalleryDoc) {
  const [a, b] = g.c1 && g.c2 ? [g.c1, g.c2] : pairFor(g.caption || g.id);
  return grad(a, b);
}

function ratioOf(g: GalleryDoc): number {
  if (g.w && g.h) return g.h / g.w;
  if (g.ratio) return g.ratio;
  return 1.15;
}

function GalleryTile({
  g,
  index,
  onOpen,
  onMeasure,
}: {
  g: GalleryDoc;
  index: number;
  onOpen: () => void;
  onMeasure: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const hasImg = Boolean(g.imageUrl);
  // "Feature" tiles get wider on large screens for a collage feel.
  const feature = index % 7 === 3 || ratioOf(g) <= 0.62; // periodic, or wide panoramas
  const wide = (g.w && g.h ? g.w / g.h : 1) >= 1.5;

  return (
    <button
      className={
        "gtile" +
        (feature || wide ? " wide" : "") +
        (loaded || !hasImg ? " ready" : "")
      }
      data-ratio={ratioOf(g).toFixed(4)}
      onClick={onOpen}
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
          <img
            src={g.imageUrl}
            alt={g.caption || ""}
            loading="lazy"
            decoding="async"
            onLoad={() => {
              setLoaded(true);
              onMeasure();
            }}
          />
        ) : (
          <span className="gph">
            <span className="grain" style={{ opacity: 0.4 }} />
          </span>
        )}
        <span className="gsheen" aria-hidden />
        {hasImg && (
          <ShareStoryButton imageUrl={g.imageUrl} caption={g.caption} variant="tile" />
        )}
      </span>
      {g.caption ? <span className="cap">{g.caption}</span> : null}
    </button>
  );
}

export default function GalleryClient({ items }: { items: GalleryDoc[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const layout = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cols = getComputedStyle(grid)
      .gridTemplateColumns.split(" ")
      .filter(Boolean).length;
    const allowWide = cols >= 4;

    const tiles = Array.from(grid.querySelectorAll<HTMLElement>(".gtile"));
    for (const t of tiles) {
      const isWide = allowWide && t.classList.contains("wide");
      t.style.gridColumn = isWide ? "span 2" : "";
      const w = t.getBoundingClientRect().width || 1;
      const r = parseFloat(t.dataset.ratio || "1.15");
      const contentH = w * r;
      const span = Math.max(1, Math.round((contentH + GAP) / (ROW + GAP)));
      t.style.gridRowEnd = `span ${span}`;
    }
  }, []);

  useEffect(() => {
    layout();
    const ro = new ResizeObserver(() => layout());
    if (gridRef.current) ro.observe(gridRef.current);
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(layout);
    };
    window.addEventListener("resize", onResize);
    const t1 = setTimeout(layout, 250);
    const t2 = setTimeout(layout, 900);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [layout, items]);

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
      <div className="masonry" ref={gridRef}>
        {items.map((g, i) => (
          <GalleryTile
            key={g.id}
            g={g}
            index={i}
            onOpen={() => setActive(i)}
            onMeasure={layout}
          />
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
