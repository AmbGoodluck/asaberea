"use client";

import { useEffect, useRef } from "react";

// A simplified but recognizable Africa silhouette: the wide north, the Horn
// of Africa's point in the northeast, the Gulf of Guinea's inward bite on
// the west coast, and the taper down to the Cape in the south.
const AFRICA =
  "M32 8 C42 3 56 3 64 9 C70 13 74 18 78 24 C85 26 93 29 90 36 " +
  "C89 41 83 43 79 40 C78 49 82 57 79 65 C77 73 81 80 74 87 " +
  "C69 93 60 97 53 95 C47 94 43 90 42 84 C38 78 36 70 35 62 " +
  "C34 56 30 52 27 50 C30 47 29 43 24 40 C22 34 19 27 22 20 " +
  "C24 14 28 10 32 8 Z";

// Madagascar, off the southeast coast.
const MADAGASCAR =
  "M85 64 C88 63 90 66 89 70 C88 76 87 82 84 86 C82 88 80 85 81 80 C82 74 83 68 85 64 Z";

// A few "nations" that orbit as points of light around the continent.
const DOTS = [
  { x: 40, y: 15, d: 0 },
  { x: 62, y: 14, d: 1.2 },
  { x: 83, y: 33, d: 2.1 },
  { x: 73, y: 55, d: 0.6 },
  { x: 58, y: 80, d: 1.7 },
  { x: 45, y: 60, d: 2.6 },
  { x: 30, y: 38, d: 0.9 },
];

export default function AfricaHero() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    let running = false;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 16;
      ty = ((e.clientY - (r.top + r.height / 2)) / r.height) * 16;
    };
    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.transform = `rotateY(${cx}deg) rotateX(${-cy}deg)`;
      raf = requestAnimationFrame(loop);
    };
    // Only animate while the hero is on screen and the tab is visible.
    const start = () => {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "120px" }
    );
    io.observe(el);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="africa-stage" aria-hidden>
      <div className="africa-glow" />
      <div className="africa-tilt" ref={wrapRef}>
        <div className="africa-float">
          <svg viewBox="0 0 100 100" className="africa-svg">
            <defs>
              <linearGradient id="kenteFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#E4623F" />
                <stop offset="0.35" stopColor="#E39321" />
                <stop offset="0.62" stopColor="#0E7C6F" />
                <stop offset="1" stopColor="#5A1B48" />
              </linearGradient>
              <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#1F1810" floodOpacity="0.45" />
              </filter>
            </defs>
            <path d={AFRICA} fill="url(#kenteFill)" filter="url(#soft)" />
            <path d={MADAGASCAR} fill="url(#kenteFill)" filter="url(#soft)" />
            <path d={AFRICA} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />
            <path d={MADAGASCAR} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />
            {/* woven texture lines clipped to the continent */}
            <clipPath id="clip"><path d={AFRICA} /></clipPath>
            <g clipPath="url(#clip)" opacity="0.14">
              {Array.from({ length: 14 }).map((_, i) => (
                <line key={i} x1={-10 + i * 8} y1={-5} x2={-30 + i * 8} y2={105} stroke="#fff" strokeWidth="1.4" />
              ))}
            </g>
          </svg>
          {DOTS.map((p, i) => (
            <span
              key={i}
              className="africa-dot"
              style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.d}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
