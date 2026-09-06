"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Handles scroll-reveal animations and the home-page stat counters.
// Re-runs on every route change so newly mounted content animates in.
export default function ClientEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
      reveals.forEach((el) => {
        el.classList.remove("in");
        io.observe(el);
      });
      // reveal anything already on-screen immediately
      requestAnimationFrame(() => {
        reveals.forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight * 0.95) {
            el.classList.add("in");
          }
        });
      });
    }

    // count-up numbers
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    const run = (el: HTMLElement) => {
      const target = parseFloat(el.getAttribute("data-count") || "0");
      const pre = el.getAttribute("data-prefix") || "";
      const suf = el.getAttribute("data-suffix") || "";
      if (reduce) {
        el.textContent = pre + target + suf;
        return;
      }
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / 1300, 1);
        el.textContent = pre + Math.round((1 - Math.pow(1 - p, 3)) * target) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window && counters.length) {
      const io2 = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              run(e.target as HTMLElement);
              io2.unobserve(e.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => io2.observe(el));
    } else {
      counters.forEach(run);
    }
  }, [pathname]);

  return null;
}
