import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact · ASA Berea" };

export default function ContactPage() {
  return (
    <>
      <div className="phead">
        <div className="glow" />
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
            <div className="cs-card">
              <div className="lbl" style={{ color: "var(--rust)" }}>Reach us</div>
              <h3 className="ny">The ASA family</h3>
              <p>
                We meet regularly through the semester and welcome new faces at every event. Membership
                is open to all Berea students, faculty, and staff.
              </p>
              <div className="cs-links">
                <a href="https://instagram.com/asa.berea" target="_blank" rel="noreferrer">
                  <span>Instagram</span>
                  <span className="cs-handle">@asa.berea</span>
                </a>
                <div className="cs-row"><span>Campus</span><span className="cs-handle">Berea College, Kentucky</span></div>
                <div className="cs-row"><span>Membership</span><span className="cs-handle">$6 per semester</span></div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
