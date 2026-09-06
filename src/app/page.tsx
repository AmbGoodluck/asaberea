import Link from "next/link";
import EventReel from "@/components/EventReel";
import { EventCard } from "@/components/cards";
import { events, pillars } from "@/lib/data";

export default function HomePage() {
  const upcoming = events.filter((e) => e.status === "upcoming").slice(0, 3);

  return (
    <>
      <header className="hero">
        <div className="glow" />
        <span className="hero-mark logo-mark" aria-hidden />
        <div className="wrap">
          <div className="hero-copy">
            <div className="lbl">African Students Association · Berea College</div>
            <h1 className="ny">
              One continent.
              <br />
              <span className="l-teal">Many nations.</span>
              <br />
              <span className="em">One&nbsp;family.</span>
            </h1>
            <p className="sub">
              A home for African students at Berea — and for everyone drawn to the continent&apos;s
              culture, its ideas, and its people. Come find your people.
            </p>
            <div className="hero-cta">
              <Link href="/about" className="btn solid">Become a member</Link>
              <Link href="/events" className="btn ghost">See what&apos;s happening</Link>
            </div>
            <div className="kente-line" />
          </div>
        </div>
      </header>

      <section className="energy">
        <div className="wrap cap">
          <div>
            <div className="lbl" style={{ color: "var(--rust)" }}>Always something happening</div>
            <h3 className="ny">A year in the life of ASA</h3>
          </div>
          <div className="lbl">@asa.berea →</div>
        </div>
        <EventReel />
        <div className="drag-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6l-4 6 4 6M16 6l4 6-4 6" />
          </svg>
          Drag to explore
        </div>
      </section>

      <section className="stats">
        <div className="wrap stat-grid">
          <div className="stat reveal s1"><div className="n" data-count="9">0</div><div className="k">Nations on campus</div></div>
          <div className="stat reveal s2"><div className="n" data-count="24" data-suffix="+">0</div><div className="k">Events a year</div></div>
          <div className="stat reveal s3"><div className="n" data-count="10">0</div><div className="k">EC leaders</div></div>
          <div className="stat reveal s4"><div className="n" data-prefix="$" data-count="5">0</div><div className="k">To join</div></div>
        </div>
      </section>

      <section className="pillars">
        <div className="grain" style={{ opacity: 0.35 }} />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="lbl reveal" style={{ color: "var(--on-panel-faint)" }}>What we stand for</div>
          <h2 className="ny reveal">Four kinds of awareness.</h2>
          <div className="pgrid">
            {pillars.map((p, i) => (
              <div className={"pcol reveal s" + (i < 2 ? 1 : 2)} key={p.idx}>
                <div className="idx">{p.idx}</div>
                <div className="t">{p.title}</div>
                <div className="d">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="shead reveal">
            <div>
              <div className="lbl">This semester</div>
              <h2 className="ny">Gather with us</h2>
            </div>
            <Link href="/events" className="seclink">All events →</Link>
          </div>
          <div className="grid3">
            {upcoming.map((e, i) => (
              <EventCard e={e} key={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="join">
        <div className="wrap">
          <div className="join-box reveal">
            <div className="aura" />
            <div className="grain" style={{ opacity: 0.35 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="lbl" style={{ color: "var(--on-panel-faint)" }}>Membership</div>
              <h2 className="ny">
                Join for <span className="em">$5</span> a semester.
                <br />
                Belong for life.
              </h2>
              <p>Dues, two events a semester, and a whole community waiting to meet you. That&apos;s all it takes.</p>
              <Link href="/about" className="btn light">Become a member</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
