"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { grad } from "@/lib/data";
import { pairFor } from "./cards";
import type { EventDoc } from "@/lib/firebase/schema";

function tileBg(e: EventDoc) {
  if (e.imageUrl) return { backgroundImage: `url(${e.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
  const [a, b] = e.c1 && e.c2 ? [e.c1, e.c2] : pairFor(e.title);
  return { background: grad(a, b) };
}

function Tile({ e }: { e: EventDoc }) {
  const down = useRef({ x: 0, y: 0, t: 0 });
  return (
    <Link
      href={`/events/${e.slug}`}
      className="tile"
      draggable={false}
      onPointerDown={(ev) => {
        down.current = { x: ev.clientX, y: ev.clientY, t: Date.now() };
      }}
      onClick={(ev) => {
        const dx = Math.abs(ev.clientX - down.current.x);
        const dy = Math.abs(ev.clientY - down.current.y);
        // Treat a drag (reel scrub) as not-a-click.
        if (dx + dy > 8) ev.preventDefault();
      }}
    >
      <div className="tile-img" style={tileBg(e)} />
      <div className="tile-vig" />
      <div className="chip">{e.category}</div>
      <div className="ct">
        <div className="dt">
          {e.date}
          {e.venue ? " · " + e.venue.toUpperCase() : ""}
        </div>
        <div className="nm">{e.title}</div>
      </div>
    </Link>
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

    let running = false;
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
    const start = () => {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    // Pause the marquee when it scrolls off screen or the tab is hidden.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "150px" }
    );
    io.observe(reel);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

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
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
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

export default function EventReel({ events }: { events: EventDoc[] }) {
  const half = Math.ceil(events.length / 2) || 1;
  const rowA = events.slice(0, half);
  const rowB = events.slice(half).concat(events.slice(0, Math.max(0, 2)));
  const a = useReel(-0.55);
  const b = useReel(0.42);

  if (!events.length) return null;

  return (
    <>
      <div className="reel" ref={a.reelRef}>
        <div className="reel-track" ref={a.trackRef}>
          {[...rowA, ...rowA].map((e, i) => (
            <Tile e={e} key={"a" + i} />
          ))}
        </div>
      </div>
      {rowB.length > 0 && (
        <div className="reel" ref={b.reelRef} style={{ marginTop: 22 }}>
          <div className="reel-track" ref={b.trackRef}>
            {[...rowB, ...rowB].map((e, i) => (
              <Tile e={e} key={"b" + i} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
