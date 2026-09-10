"use client";

import { useEffect, useRef } from "react";

// Stylized Africa silhouette (motif, not a precise map). Kept smooth and
// abstract so it reads as an emblem in the Apple sense: simple, iconic, crisp.
const AFRICA =
  "M50 4 C58 4 63 6 66 10 C69 13 71 16 74 17 C78 18 82 19 83 23 C84 27 80 30 79 34 " +
  "C78 39 80 43 77 47 C74 52 71 55 69 60 C67 66 66 71 62 77 C58 83 55 90 49 92 " +
  "C45 93 42 90 41 86 C40 81 41 77 38 73 C35 68 31 65 29 59 C27 53 27 47 25 42 " +
  "C23 38 19 36 19 31 C19 27 22 25 25 22 C29 18 30 13 35 9 C39 6 44 4 50 4 Z";

// A few "nations" that orbit as points of light around the continent.
const DOTS = [
  { x: 40, y: 18, d: 0 },
  { x: 66, y: 26, d: 1.2 },
  { x: 72, y: 44, d: 2.1 },
  { x: 58, y: 66, d: 0.6 },
  { x: 44, y: 80, d: 1.7 },
  { x: 30, y: 52, d: 2.6 },
  { x: 28, y: 30, d: 0.9 },
];

export default function AfricaHero() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
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
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
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
            <path d={AFRICA} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />
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
