import type { Metadata } from "next";
import { getLeadership } from "@/lib/content";
import { RoleCard } from "@/components/cards";

export const revalidate = 60;
export const metadata: Metadata = { title: "Leadership & Roles · ASA Berea" };

export default async function LeadershipPage() {
  const roster = await getLeadership();
  return (
    <>
      <div className="phead">
        <div className="glow" />
        <div className="wrap">
          <div className="lbl">Leadership &amp; Roles</div>
          <h1 className="ny">Meet the <span className="em">Executive Committee</span>.</h1>
          <p>
            ASA is led by an elected Executive Committee, each serving one academic year. These are
            the people and roles that keep the association running, refreshed each election cycle.
          </p>
        </div>
      </div>

      <section style={{ padding: "64px 0 92px" }}>
        <div className="wrap">
          <div className="ec-grid">
            {roster.map((r) => (
              <RoleCard r={r} key={r.id} />
            ))}
          </div>
          <div className="note reveal" style={{ marginTop: 34 }}>
            The Executive Committee is elected each spring and outdoored at the annual ASA Banquet.
            Interested in running? Any active member in good standing is eligible, so talk to a
            current officer.
          </div>
        </div>
      </section>
    </>
  );
}
