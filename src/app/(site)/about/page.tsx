import Link from "next/link";
import type { Metadata } from "next";
import { pillars } from "@/lib/data";
import { SIGNUP_URL } from "@/lib/links";
import { getImageSlots } from "@/lib/content";
import PheadBackdrop from "@/components/PheadBackdrop";

export const revalidate = 60;
export const metadata: Metadata = { title: "About · ASA Berea" };

export default async function AboutPage() {
  const images = await getImageSlots();
  const hero = images["about-hero"];
  const story = images["about-story"];

  return (
    <>
      <div className="phead">
        <div className="glow" />
        <PheadBackdrop slot={hero} />
        <div className="wrap">
          <div className="lbl">About us</div>
          <h1 className="ny">Where Africa <span className="em">meets</span> Berea.</h1>
          <p>
            We are the African Students Association, a student body devoted to the propagation of
            academic skill, the discussion of current issues, and the growth of leadership, unity,
            and belonging on Berea&apos;s campus.
          </p>
        </div>
      </div>

      <section className="sec">
        <div className="wrap">
          <div className="big reveal ny">
            “We believe in creating an atmosphere where students convene socially and academically to
            grow together as <span className="em">young men and women of value</span> to our societies.”
          </div>
          <div className="lbl reveal" style={{ marginTop: 26 }}>From the ASA Constitution, Preamble</div>
        </div>
      </section>

      <section style={{ padding: "20px 0 80px" }}>
        <div className="wrap two-col">
          <div
            className="mission-img reveal"
            style={
              story?.url
                ? { backgroundImage: `url(${story.url})`, backgroundPosition: story.position }
                : undefined
            }
          >
            {!story?.url && <div className="ov" />}
            <div className="grain" style={{ opacity: story?.url ? 0.15 : 0.4 }} />
          </div>
          <div className="about-body reveal s1">
            <div className="lbl" style={{ color: "var(--rust)" }}>Our story</div>
            <h2 className="ny" style={{ fontWeight: 400, fontSize: "clamp(26px,3.4vw,36px)", letterSpacing: "-.02em", margin: "12px 0 20px" }}>
              A voice, a home, and a family.
            </h2>
            <p>
              The African Students Association exists to represent and advance our collective cause on
              campus, to share the wealth and greatness of Africa, and to experience the richness of
              the wider Berea community in return.
            </p>
            <p>
              We open our doors to a multicultural society, devoted to peace and unity. Membership is
              open to all, students, faculty, and staff, with no discrimination on any basis, in the
              spirit of the First Amendment and universal human rights.
            </p>
            <p>
              Above all, we are a family. Whether you are far from home or simply curious about the
              continent, there is a place for you here.
            </p>
          </div>
        </div>
      </section>

      <section className="pillars">
        <div className="grain" style={{ opacity: 0.35 }} />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="lbl reveal" style={{ color: "var(--on-panel-faint)" }}>Our purpose</div>
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

      <section className="sec">
        <div className="wrap">
          <div className="shead reveal">
            <div>
              <div className="lbl">Why join</div>
              <h2 className="ny">More than a club</h2>
            </div>
          </div>
          <div className="value-row">
            <div className="vcard reveal s1">
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /></svg>
              </div>
              <h4>Belonging</h4>
              <p>A ready-made family the day you arrive, people who get where you&apos;re from and where you&apos;re going.</p>
            </div>
            <div className="vcard reveal s2">
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 3l8 4-8 4-8-4 8-4zM4 11l8 4 8-4M4 15l8 4 8-4" /></svg>
              </div>
              <h4>Growth</h4>
              <p>Leadership roles, networking, and a referral service to help you thrive academically and beyond.</p>
            </div>
            <div className="vcard reveal s3">
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M8 3v4M16 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /></svg>
              </div>
              <h4>Culture</h4>
              <p>Food, music, film, and celebration all year, the continent, brought to Kentucky.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="join">
        <div className="wrap">
          <div className="membership reveal">
            <div className="aura" />
            <div className="grain" style={{ opacity: 0.35 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="lbl" style={{ color: "var(--on-panel-faint)" }}>How membership works</div>
              <h2 className="ny" style={{ fontWeight: 300, fontSize: "clamp(30px,4.4vw,44px)", letterSpacing: "-.02em", margin: "12px 0 0", color: "var(--on-panel)" }}>
                Three simple steps.
              </h2>
              <div className="mrow">
                <div className="mstep"><div className="num">01</div><h4>Pay your dues</h4><p>Just $6 per semester. Donations above that are always welcome and support our events.</p></div>
                <div className="mstep"><div className="num">02</div><h4>Show up</h4><p>Attend at least two ASA events a semester, the easiest part, we promise.</p></div>
                <div className="mstep"><div className="num">03</div><h4>Take part</h4><p>Participate in the activities we sponsor, and help shape what ASA becomes.</p></div>
              </div>
              <div style={{ marginTop: 36, display: "flex", gap: 14, flexWrap: "wrap" }}>
                <a href={SIGNUP_URL} target="_blank" rel="noreferrer" className="btn light">Become a member</a>
                <Link href="/events" className="btn ghost on-dark">Come to an event</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
