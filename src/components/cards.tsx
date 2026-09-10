import Link from "next/link";
import { grad } from "@/lib/data";
import type { EventDoc, LeaderDoc } from "@/lib/firebase/schema";
import type { Product as SeedProduct } from "@/lib/data";

const PAIRS: [string, string][] = [
  ["#C2451F", "#E39321"],
  ["#0E7C6F", "#0A5148"],
  ["#5A1B48", "#8A2C6B"],
  ["#D89321", "#B2401F"],
  ["#B23A20", "#4A163B"],
  ["#0A5148", "#0E7C6F"],
];
export function pairFor(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PAIRS[h % PAIRS.length];
}

function bg(imageUrl: string, c1?: string, c2?: string, seed = "x") {
  if (imageUrl) return { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
  const [a, b] = c1 && c2 ? [c1, c2] : pairFor(seed);
  return { background: grad(a, b) };
}

export function EventCard({ e }: { e: EventDoc }) {
  return (
    <Link href={`/events/${e.slug}`} className="card reveal card-link">
      <div className="ph" style={bg(e.imageUrl, e.c1, e.c2, e.title)}>
        {!e.imageUrl && <div className="grain" />}
        <div className="chip">{e.category}</div>
      </div>
      <div className="bd">
        <div className="dt">
          {[e.date, e.time, e.venue && e.venue.toUpperCase()].filter(Boolean).join(" · ")}
        </div>
        <div className="nm ny">{e.title}</div>
        <div className="ds">{e.description}</div>
        <span className="ev-link" aria-hidden>
          View details
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </div>
    </Link>
  );
}

export function RoleCard({ r }: { r: LeaderDoc }) {
  const [a, b] = pairFor(r.position || r.name);
  return (
    <div className="ec reveal">
      {r.imageUrl ? (
        <span className="av" style={{ backgroundImage: `url(${r.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      ) : (
        <span className="av" style={{ background: grad(a, b) }}>{(r.name && r.name !== "Position open" ? r.name : r.position)[0]}</span>
      )}
      <div className="role ny">{r.position}</div>
      <div className="who">{r.name}{r.major ? " · " + r.major : ""}</div>
      <div className="duty">{r.description}</div>
    </div>
  );
}

export function ProductCard({ p }: { p: SeedProduct }) {
  return (
    <div className="prod reveal">
      <div className="pimg" style={{ background: grad(p.c1, p.c2) }}>
        <span className="logo-mark lg" aria-hidden />
        <div className="grain" style={{ opacity: 0.3 }} />
      </div>
      <div className="bd">
        <div className="nm ny">{p.name}</div>
        <div className="meta">
          <span className="price">{p.price}</span>
          <span className="sz">{p.sizes}</span>
        </div>
        <a
          className="btn solid buy"
          href={process.env.NEXT_PUBLIC_STORE_CHECKOUT_BASE || "#"}
          target="_blank"
          rel="noreferrer"
        >
          Buy now
        </a>
      </div>
    </div>
  );
}
