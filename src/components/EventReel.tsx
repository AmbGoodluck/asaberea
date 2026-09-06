"use client";

import { useEffect, useRef } from "react";
import { events, grad, type EventItem } from "@/lib/data";

function Tile({ e }: { e: EventItem }) {
  return (
    <div className="tile">
      <div className="tile-img" style={{ background: grad(e.c1, e.c2) }} />
      <div className="tile-vig" />
      <div className="chip">{e.category}</div>
      <div className="ct">
        <div className="dt">
          {e.date} · {e.venue.toUpperCase()}
        </div>
        <div className="nm">{e.title}</div>
      </div>
    </div>
  );
}

function useReel(speed: number) {
  const reelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reel = reelRef.current;
    const track = trackRef.current;
    if (!reel || !track) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let x = 0;
    let vel = reduce ? 0 : speed;
    const base = reduce ? 0 : speed;
    let span = track.scrollWidth / 2 || 1;
    let hover = false;
    let dragging = false;
    let px = 0;
    let pt = 0;
    let dv = 0;
    let pid: number | null = null;
    let raf = 0;

    const measure = () => (span = track.scrollWidth / 2 || 1);
    measure();
    window.addEventListener("resize", measure);

    const loop = () => {
      if (!dragging) {
        const tg = hover ? 0 : base;
        vel += (tg - vel) * 0.05;
        x += vel;
      }
      while (x <= -span) x += span;
      while (x > 0) x -= span;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const down = (e: PointerEvent) => {
      dragging = true;
      reel.classList.add("drag");
      pid = e.pointerId;
      reel.setPointerCapture(pid);
      px = e.clientX;
      pt = performance.now();
      dv = 0;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - px;
      const now = performance.now();
      const dt = now - pt || 16;
      x += dx;
      dv = (dx / dt) * 16;
      px = e.clientX;
      pt = now;
      while (x <= -span) x += span;
      while (x > 0) x -= span;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    };
    const rel = () => {
      if (!dragging) return;
      dragging = false;
      reel.classList.remove("drag");
      vel = Math.max(-60, Math.min(60, dv));
      if (pid !== null) {
        try {
          reel.releasePointerCapture(pid);
        } catch {}
        pid = null;
      }
    };
    const enter = () => (hover = true);
    const leave = () => (hover = false);

    reel.addEventListener("pointerdown", down);
    reel.addEventListener("pointermove", move);
    reel.addEventListener("pointerup", rel);
    reel.addEventListener("pointercancel", rel);
    reel.addEventListener("mouseenter", enter);
    reel.addEventListener("mouseleave", leave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      reel.removeEventListener("pointerdown", down);
      reel.removeEventListener("pointermove", move);
      reel.removeEventListener("pointerup", rel);
      reel.removeEventListener("pointercancel", rel);
      reel.removeEventListener("mouseenter", enter);
      reel.removeEventListener("mouseleave", leave);
    };
  }, [speed]);

  return { reelRef, trackRef };
}

export default function EventReel() {
  const rowA = events.slice(0, 6);
  const rowB = events.slice(6).concat(events.slice(0, 2));
  const a = useReel(-0.55);
  const b = useReel(0.42);

  return (
    <>
      <div className="reel" ref={a.reelRef}>
        <div className="reel-track" ref={a.trackRef}>
          {[...rowA, ...rowA].map((e, i) => (
            <Tile e={e} key={"a" + i} />
          ))}
        </div>
      </div>
      <div className="reel" ref={b.reelRef} style={{ marginTop: 22 }}>
        <div className="reel-track" ref={b.trackRef}>
          {[...rowB, ...rowB].map((e, i) => (
            <Tile e={e} key={"b" + i} />
          ))}
        </div>
      </div>
    </>
  );
}
