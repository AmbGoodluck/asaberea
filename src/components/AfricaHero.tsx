"use client";

import { useEffect, useRef } from "react";

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/africa.webp"
            alt=""
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              userSelect: "none",
              filter: "drop-shadow(0 30px 60px rgba(31,24,16,.35))",
            }}
          />
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
