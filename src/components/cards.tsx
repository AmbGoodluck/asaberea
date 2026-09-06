import { grad, type EventItem, type Story, type Role, type Product } from "@/lib/data";

export function EventCard({ e }: { e: EventItem }) {
  return (
    <div className="card reveal">
      <div className="ph" style={{ background: grad(e.c1, e.c2) }}>
        <div className="grain" />
        <div className="chip">{e.category}</div>
      </div>
      <div className="bd">
        <div className="dt">
          {e.date} · {e.time} · {e.venue.toUpperCase()}
        </div>
        <div className="nm ny">{e.title}</div>
        <div className="ds">{e.desc}</div>
      </div>
    </div>
  );
}

export function StoryCard({ s }: { s: Story }) {
  return (
    <div className="card reveal">
      <div className="ph" style={{ background: grad(s.c1, s.c2) }}>
        <div className="grain" />
        <div className="chip">{s.tag}</div>
      </div>
      <div className="bd">
        <div className="nm ny">{s.title}</div>
        <div className="ds">{s.excerpt}</div>
        <div className="dt" style={{ marginTop: 14 }}>
          {s.read} read
        </div>
      </div>
    </div>
  );
}

export function RoleCard({ r }: { r: Role }) {
  return (
    <div className="ec reveal">
      <div className="av" style={{ background: grad(r.c1, r.c2) }}>
        {r.role[0]}
      </div>
      <div className="role ny">{r.role}</div>
      <div className="who">Position open</div>
      <div className="duty">{r.duty}</div>
      {r.tag ? <span className="tag">{r.tag}</span> : null}
    </div>
  );
}

export function ProductCard({ p }: { p: Product }) {
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
