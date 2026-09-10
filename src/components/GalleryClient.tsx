"use client";

import { useState } from "react";
import { grad } from "@/lib/data";
import { pairFor } from "./cards";
import type { GalleryDoc } from "@/lib/firebase/schema";

function bg(g: GalleryDoc) {
  if (g.imageUrl) return { backgroundImage: `url(${g.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
  const [a, b] = g.c1 && g.c2 ? [g.c1, g.c2] : pairFor(g.caption || g.id);
  return { background: grad(a, b) };
}

export default function GalleryClient({ items }: { items: GalleryDoc[] }) {
  const [active, setActive] = useState<GalleryDoc | null>(null);

  return (
    <>
      <div className="masonry">
        {items.map((g) => (
          <div
            key={g.id}
            className="gtile"
            onClick={() => setActive(g)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActive(g)}
          >
            <div style={{ ...bg(g), aspectRatio: `1 / ${g.ratio || 1}`, position: "relative" }}>
              {!g.imageUrl && <div className="grain" style={{ opacity: 0.4 }} />}
              {g.caption ? <div className="cap">{g.caption}</div> : null}
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div className="lightbox" onClick={() => setActive(null)}>
          <button className="lx" aria-label="Close" onClick={() => setActive(null)}>
            ✕
          </button>
          <div className="lb" style={bg(active)} onClick={(e) => e.stopPropagation()}>
            {!active.imageUrl && <div className="grain" style={{ opacity: 0.4 }} />}
            {active.caption ? <div className="lcap">{active.caption}</div> : null}
          </div>
        </div>
      )}
    </>
  );
}
