import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSpotlights, getSpotlightBySlug } from "@/lib/content";
import { grad } from "@/lib/data";
import { pairFor, SpotlightCard } from "@/components/cards";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const spotlights = await getSpotlights();
  return spotlights.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSpotlightBySlug(slug);
  if (!s) return { title: "Spotlight not found · ASA Berea" };
  return {
    title: `${s.name} · ASA Berea`,
    description: s.description?.slice(0, 160) || s.headline,
    openGraph: s.imageUrl ? { images: [s.imageUrl] } : undefined,
  };
}

export default async function SpotlightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = await getSpotlightBySlug(slug);
  if (!s) notFound();

  const all = await getSpotlights();
  const more = all.filter((x) => x.slug !== s.slug).slice(0, 3);
  const [a, b] = pairFor(s.name);

  return (
    <>
      <div className="phead event-phead">
        <div className="glow" />
        <div className="wrap">
          <Link href="/spotlight" className="back-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
            All spotlights
          </Link>
          <div className="lbl" style={{ marginTop: 18 }}>{s.headline}</div>
          <h1 className="ny">{s.name}</h1>
        </div>
      </div>

      <section className="sec">
        <div className="wrap event-body">
          <div className={"event-hero-img" + (s.imageUrl ? "" : " grad-only")}>
            {s.imageUrl ? (
              <>
                <div className="ehi-blur" style={{ backgroundImage: `url(${s.imageUrl})` }} aria-hidden />
                <img className="ehi-photo" src={s.imageUrl} alt={s.name} />
              </>
            ) : (
              <div className="ehi-grad" style={{ background: grad(a, b) }}>
                <div className="grain" style={{ opacity: 0.4 }} />
              </div>
            )}
          </div>
          <div className="event-copy">
            {(s.description || "").split(/\n{2,}/).filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            {!s.description && <p>More about {s.name} is coming soon.</p>}
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section className="band">
          <div className="wrap">
            <div className="shead reveal">
              <div>
                <div className="lbl">Keep exploring</div>
                <h2 className="ny">More spotlights</h2>
              </div>
              <Link href="/spotlight" className="seclink">All spotlights →</Link>
            </div>
            <div className="spot-grid">
              {more.map((m) => (
                <SpotlightCard s={m} key={m.id} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
