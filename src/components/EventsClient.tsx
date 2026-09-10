"use client";

import { useEffect, useRef, useState } from "react";
import { EventCard } from "./cards";
import type { EventDoc } from "@/lib/firebase/schema";

const cats = ["all", "Cultural", "Social", "Meeting", "Panel"] as const;

export default function EventsClient({ events }: { events: EventDoc[] }) {
  const [filter, setFilter] = useState<string>("all");
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    wrapRef.current?.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  }, [filter]);

  const match = (c: string) => filter === "all" || c === filter;
  const upcoming = events.filter((e) => !e.isPast && match(e.category));
  const past = events.filter((e) => e.isPast && match(e.category));

  return (
    <div ref={wrapRef}>
      <section style={{ padding: "64px 0 40px" }}>
        <div className="wrap">
          <div className="filters">
            {cats.map((c) => (
              <button
                key={c}
                className={"chipbtn" + (filter === c ? " on" : "")}
                onClick={() => setFilter(c)}
              >
                {c === "all" ? "All" : c === "Meeting" ? "Meetings" : c === "Panel" ? "Panels" : c}
              </button>
            ))}
          </div>
          <div className="lbl" style={{ marginBottom: 22 }}>Upcoming</div>
          {upcoming.length ? (
            <div className="grid3">
              {upcoming.map((e) => (
                <EventCard e={e} key={e.id} />
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--faint)" }}>No upcoming events in this category yet.</p>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section style={{ padding: "40px 0 92px" }}>
          <div className="wrap">
            <div className="lbl" style={{ marginBottom: 22, color: "var(--faint)" }}>
              Past events · the archive
            </div>
            <div className="grid3">
              {past.map((e) => (
                <EventCard e={e} key={e.id} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
