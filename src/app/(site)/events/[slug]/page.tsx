import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEvents, getEventBySlug } from "@/lib/content";
import { grad } from "@/lib/data";
import { pairFor } from "@/components/cards";
import { EventCard } from "@/components/cards";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return { title: "Event not found · ASA Berea" };
  return {
    title: `${e.title} · ASA Berea`,
    description: e.description?.slice(0, 160),
    openGraph: e.imageUrl ? { images: [e.imageUrl] } : undefined,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) notFound();

  const all = await getEvents();
  const more = all
    .filter((x) => x.slug !== e.slug && x.isPast === e.isPast)
    .slice(0, 3);

  const [a, b] = e.c1 && e.c2 ? [e.c1, e.c2] : pairFor(e.title);
  const meta = [e.date, e.time, e.venue].filter(Boolean).join("  ·  ");

  return (
    <>
      <div className="phead event-phead">
        <div className="glow" />
        <div className="wrap">
          <Link href="/events" className="back-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
            All events
          </Link>
          <div className="lbl" style={{ marginTop: 18 }}>
            {e.category}
            {e.isPast ? "  ·  Past event" : ""}
          </div>
          <h1 className="ny">{e.title}</h1>
          {meta && <p className="event-meta">{meta}</p>}
        </div>
      </div>

      <section className="sec">
        <div className="wrap event-body">
          <div
            className="event-hero-img"
            style={
              e.imageUrl
                ? { backgroundImage: `url(${e.imageUrl})` }
                : { background: grad(a, b) }
            }
          >
            {!e.imageUrl && <div className="grain" style={{ opacity: 0.4 }} />}
          </div>

          <div className="event-copy">
            {e.description
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}

            {e.link && (
              <a
                href={e.link}
                target="_blank"
                rel="noreferrer"
                className="btn solid"
                style={{ marginTop: 10 }}
              >
                {e.isPast ? "See more" : "RSVP / details"}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
            )}
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section className="band">
          <div className="wrap">
            <div className="shead reveal">
              <div>
                <div className="lbl">{e.isPast ? "More from the archive" : "Also coming up"}</div>
                <h2 className="ny">Keep exploring</h2>
              </div>
              <Link href="/events" className="seclink">All events →</Link>
            </div>
            <div className="grid3">
              {more.map((m) => (
                <EventCard e={m} key={m.id} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
