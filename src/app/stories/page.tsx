import type { Metadata } from "next";
import StoriesClient from "@/components/StoriesClient";

export const metadata: Metadata = { title: "Blog & Stories · ASA Berea" };

export default function StoriesPage() {
  return (
    <>
      <div className="phead">
        <div className="glow" />
        <div className="wrap">
          <div className="lbl">Blog &amp; Stories</div>
          <h1 className="ny">In our own <span className="em">words</span>.</h1>
          <p>Reflections, opinions, and member spotlights — the voice of ASA, written by the people who live it.</p>
        </div>
      </div>

      <section style={{ padding: "64px 0 40px" }}>
        <div className="wrap">
          <div className="two-col reveal" style={{ gap: 56 }}>
            <div className="mission-img" style={{ aspectRatio: "5 / 4" }}>
              <div className="ov" />
              <div className="grain" style={{ opacity: 0.4 }} />
              <div style={{ position: "absolute", left: 22, bottom: 20, background: "rgba(31,24,16,.5)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "8px 13px", borderRadius: 100, zIndex: 2 }}>
                Featured · Member Spotlight
              </div>
            </div>
            <div style={{ alignSelf: "center" }}>
              <div className="lbl" style={{ color: "var(--rust)" }}>Culture</div>
              <h2 className="ny" style={{ fontWeight: 400, fontSize: "clamp(28px,3.8vw,42px)", lineHeight: 1.08, letterSpacing: "-.02em", margin: "14px 0 16px" }}>
                Finding home, one shared meal at a time.
              </h2>
              <p style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}>
                A first-year reflects on the night the jollof cook-off turned a room full of strangers
                into something that felt, unmistakably, like family — and on what &ldquo;home&rdquo;
                comes to mean 5,000 miles away from it.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22 }}>
                <span className="logo-mark" style={{ width: 34, height: 34 }} aria-hidden />
                <div style={{ fontSize: 14 }}>
                  <div style={{ fontWeight: 600 }}>ASA Member</div>
                  <div style={{ color: "var(--faint)" }}>6 min read · Sep 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "30px 0 90px" }}>
        <div className="wrap">
          <StoriesClient />
        </div>
      </section>
    </>
  );
}
