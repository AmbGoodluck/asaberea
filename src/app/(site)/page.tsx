import Link from "next/link";
import EventReel from "@/components/EventReel";
import AfricaHero from "@/components/AfricaHero";
import { EventCard, pairFor } from "@/components/cards";
import { pillars, grad } from "@/lib/data";
import { getEvents, getStats, getSpotlights, getImageSlots } from "@/lib/content";
import { SIGNUP_URL } from "@/lib/links";

export const revalidate = 60;

export default async function HomePage() {
  const [events, stats, spotlights, images] = await Promise.all([
    getEvents(),
    getStats(),
    getSpotlights(),
    getImageSlots(),
  ]);
  const heroImage = images["home-hero"] || "";
  const upcoming = events.filter((e) => !e.isPast).slice(0, 3);
  const reelEvents = events.slice(0, 10);

  return (
    <>
      <header className="hero">
        <div className="glow" />
        {heroImage && (
          <div
            className="hero-backdrop"
            style={{ backgroundImage: `url(${heroImage})` }}
            aria-hidden
          />
        )}
        <AfricaHero />
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
              A home for African students at Berea, and for everyone drawn to the continent&apos;s
              culture, its ideas, and its people. Come find your people.
            </p>
            <div className="hero-cta">
              <a href={SIGNUP_URL} target="_blank" rel="noreferrer" className="btn solid">Become a member</a>
              <Link href="/events" className="btn ghost">See what&apos;s happening</Link>
            </div>
            <div className="kente-line" />
          </div>
        </div>
      </header>

      {reelEvents.length > 0 && (
        <section className="energy">
          <div className="wrap cap">
            <div>
              <div className="lbl" style={{ color: "var(--rust)" }}>Always something happening</div>
              <h3 className="ny">A year in the life of ASA</h3>
            </div>
            <a className="lbl" href="https://instagram.com/asa.berea" target="_blank" rel="noreferrer">@asa.berea →</a>
          </div>
          <EventReel events={reelEvents} />
          <div className="drag-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6l-4 6 4 6M16 6l4 6-4 6" />
            </svg>
            Drag to explore
          </div>
        </section>
      )}

      <section className="stats">
        <div className="wrap stat-grid">
          <div className="stat reveal s1"><div className="n" data-count={stats.nations}>{stats.nations}</div><div className="k">Nations on campus</div></div>
          <div className="stat reveal s2"><div className="n" data-count={stats.eventsPerYear}>{stats.eventsPerYear}</div><div className="k">Events a year</div></div>
          <div className="stat reveal s3"><div className="n" data-count={stats.ecLeaders}>{stats.ecLeaders}</div><div className="k">EC leaders</div></div>
          <div className="stat reveal s4"><div className="n" data-prefix="$" data-count={stats.joinPrice}>${stats.joinPrice}</div><div className="k">To join</div></div>
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

      {spotlights.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="shead reveal">
              <div>
                <div className="lbl">Member Spotlight</div>
                <h2 className="ny">The people who make us</h2>
              </div>
            </div>
            <div className="spot-grid">
              {spotlights.slice(0, 3).map((s) => {
                const [a, b] = pairFor(s.name);
                return (
                  <div className="spot reveal" key={s.id} style={{ position: "relative" }}>
                    <div className="spot-quote">&ldquo;</div>
                    <div className="top">
                      {s.imageUrl ? (
                        <span className="av" style={{ backgroundImage: `url(${s.imageUrl})` }} />
                      ) : (
                        <span className="av" style={{ background: grad(a, b) }}>{s.name[0]}</span>
                      )}
                      <div>
                        <div className="who">{s.name}</div>
                        <div className="head">{s.headline}</div>
                      </div>
                    </div>
                    <div className="desc">{s.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
            {upcoming.map((e) => (
              <EventCard e={e} key={e.id} />
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
                Join for <span className="em">${stats.joinPrice}</span> a semester.
                <br />
                Belong for life.
              </h2>
              <p>Dues, two events a semester, and a whole community waiting to meet you. That&apos;s all it takes.</p>
              <a href={SIGNUP_URL} target="_blank" rel="noreferrer" className="btn light">Become a member</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
