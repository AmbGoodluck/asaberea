import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import PheadBackdrop from "@/components/PheadBackdrop";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/links";
import { getImageSlots } from "@/lib/content";

export const revalidate = 60;
export const metadata: Metadata = { title: "Contact · ASA Berea" };

export default async function ContactPage() {
  const images = await getImageSlots();
  const side = images["contact-side"];

  return (
    <>
      <div className="phead">
        <div className="glow" />
        <PheadBackdrop slot={images["contact-hero"]} />
        <div className="wrap">
          <div className="lbl">Contact</div>
          <h1 className="ny">Say <span className="em">hello</span>.</h1>
          <p>
            Questions about joining, a collaboration, or just want to say hi? Send us a note and the
            team will get back to you.
          </p>
        </div>
      </div>

      <section style={{ padding: "64px 0 96px" }}>
        <div className="wrap contact-grid">
          <div className="reveal">
            <ContactForm />
          </div>
          <aside className="contact-side reveal s1">
            <div
              className="cs-card"
              style={
                side?.url
                  ? { backgroundImage: `url(${side.url})`, backgroundPosition: side.position }
                  : undefined
              }
            >
              {side?.url && <div className="cs-wash" aria-hidden />}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div className="lbl" style={{ color: "var(--rust)" }}>Reach us</div>
                <h3 className="ny">The ASA family</h3>
                <p>
                  We meet regularly through the semester and welcome new faces at every event.
                  Membership is open to all Berea students, faculty, and staff.
                </p>
                <div className="cs-links">
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                    <span>Instagram</span>
                    <span className="cs-handle">{INSTAGRAM_HANDLE}</span>
                  </a>
                  <div className="cs-row"><span>Campus</span><span className="cs-handle">Berea College, Kentucky</span></div>
                  <div className="cs-row"><span>Membership</span><span className="cs-handle">$6 per semester</span></div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
