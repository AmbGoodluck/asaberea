import type { Metadata } from "next";
import { getSpotlights } from "@/lib/content";
import { SpotlightCard } from "@/components/cards";

export const revalidate = 60;
export const metadata: Metadata = { title: "Spotlight · ASA Berea" };

export default async function SpotlightPage() {
  const spotlights = await getSpotlights();
  return (
    <>
      <div className="phead">
        <div className="glow" />
        <div className="wrap">
          <div className="lbl">Member Spotlight</div>
          <h1 className="ny">The <span className="em">people</span> who make us.</h1>
          <p>Students doing remarkable things, on campus and beyond. Tap a card for their full story.</p>
        </div>
      </div>
      <section style={{ padding: "64px 0 92px" }}>
        <div className="wrap">
          {spotlights.length ? (
            <div className="spot-grid">
              {spotlights.map((s) => (
                <SpotlightCard s={s} key={s.id} />
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--faint)" }}>No spotlights yet, check back soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
