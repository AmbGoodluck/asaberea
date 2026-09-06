import type { Metadata } from "next";
import { roster } from "@/lib/data";
import { RoleCard } from "@/components/cards";

export const metadata: Metadata = { title: "Leadership & Roles · ASA Berea" };

export default function LeadershipPage() {
  return (
    <>
      <div className="phead">
        <div className="glow" />
        <div className="wrap">
          <div className="lbl">Leadership &amp; Roles</div>
          <h1 className="ny">Meet the <span className="em">Executive Committee</span>.</h1>
          <p>
            ASA is led by an elected Executive Committee of ten, each serving one academic year. These
            are the roles that keep the association running — names and photos are refreshed each
            election cycle.
          </p>
        </div>
      </div>

      <section style={{ padding: "64px 0 92px" }}>
        <div className="wrap">
          <div className="ec-grid">
            {roster.map((r, i) => (
              <RoleCard r={r} key={i} />
            ))}
          </div>
          <div className="note reveal" style={{ marginTop: 34 }}>
            The Executive Committee is elected each spring and outdoored at the annual ASA Banquet.
            Interested in running? Any active member in good standing is eligible — talk to a current
            officer.
          </div>
        </div>
      </section>
    </>
  );
}
