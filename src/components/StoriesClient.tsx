"use client";

import { useEffect, useRef, useState } from "react";
import { stories } from "@/lib/data";
import { StoryCard } from "./cards";

const tags = ["all", "Culture", "Opinion", "Spotlight", "Campus"] as const;

export default function StoriesClient() {
  const [filter, setFilter] = useState<string>("all");
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    wrapRef.current?.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  }, [filter]);

  const list = stories.filter((s) => filter === "all" || s.tag === filter);

  return (
    <div ref={wrapRef}>
      <div className="filters">
        {tags.map((t) => (
          <button
            key={t}
            className={"chipbtn" + (filter === t ? " on" : "")}
            onClick={() => setFilter(t)}
          >
            {t === "all" ? "All" : t === "Campus" ? "Campus life" : t}
          </button>
        ))}
      </div>
      <div className="grid3">
        {list.map((s, i) => (
          <StoryCard s={s} key={i} />
        ))}
      </div>
    </div>
  );
}
