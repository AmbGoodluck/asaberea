"use client";

import { useState } from "react";
import { gallery, grad, type GalleryItem } from "@/lib/data";

export default function GalleryClient() {
  const [active, setActive] = useState<GalleryItem | null>(null);

  return (
    <>
      <div className="masonry">
        {gallery.map((g, i) => (
          <div
            key={i}
            className="gtile"
            onClick={() => setActive(g)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActive(g)}
          >
            <div style={{ background: grad(g.c1, g.c2), aspectRatio: `1 / ${g.ratio}`, position: "relative" }}>
              <div className="grain" style={{ opacity: 0.4 }} />
              <div className="cap">{g.caption}</div>
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div className="lightbox" onClick={() => setActive(null)}>
          <button className="lx" aria-label="Close" onClick={() => setActive(null)}>
            ✕
          </button>
          <div className="lb" style={{ background: grad(active.c1, active.c2) }} onClick={(e) => e.stopPropagation()}>
            <div className="grain" style={{ opacity: 0.4 }} />
            <div className="lcap">{active.caption}</div>
          </div>
        </div>
      )}
    </>
  );
}
