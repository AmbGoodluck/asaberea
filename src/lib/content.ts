import "server-only";
import { fdb } from "./firestore-rest";
import {
  COL,
  STATS_DOC,
  type EventDoc,
  type SpotlightDoc,
  type LeaderDoc,
  type GalleryDoc,
  type StatsDoc,
  type ImageSlotDoc,
} from "./firebase/schema";
import * as seed from "./data";
import { slugify } from "./slug";

// Content getters. When the service account is configured they read live data
// from Firestore over REST; otherwise they return the seed content so the
// public site is fully functional before Firebase is connected.

async function readCollection<T>(name: string): Promise<T[] | null> {
  if (!fdb.enabled) return null;
  try {
    return (await fdb.list(name)) as T[] | null;
  } catch {
    return null;
  }
}

export async function getStats(): Promise<StatsDoc> {
  if (fdb.enabled) {
    try {
      const doc = await fdb.get(COL.stats, STATS_DOC);
      if (doc) return doc as unknown as StatsDoc;
    } catch {}
  }
  return { nations: 9, eventsPerYear: 24, ecLeaders: 10, joinPrice: 6 };
}

export async function getEvents(): Promise<EventDoc[]> {
  const live = await readCollection<EventDoc>(COL.events);
  if (live && live.length) {
    return live
      .map((e) => ({ ...e, slug: e.slug || slugify(e.title) || e.id }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  return seed.events.map((e, i) => ({
    id: "seed-" + i,
    title: e.title,
    slug: slugify(e.title),
    description: e.desc,
    imageUrl: "",
    date: e.date,
    time: e.time,
    venue: e.venue,
    link: "",
    category: e.category,
    isPast: e.status === "past",
    createdAt: 1000 - i,
    c1: e.c1,
    c2: e.c2,
  }));
}

export async function getEventBySlug(slug: string): Promise<EventDoc | null> {
  const all = await getEvents();
  const matches = all.filter((e) => e.slug === slug);
  if (matches.length) return matches.sort((a, b) => b.createdAt - a.createdAt)[0];
  return all.find((e) => e.id === slug) ?? null;
}

export async function getSpotlights(): Promise<SpotlightDoc[]> {
  const live = await readCollection<SpotlightDoc>(COL.spotlights);
  if (live && live.length) return live.sort((a, b) => a.order - b.order);
  return seed.spotlights.map((s, i) => ({
    id: "seed-" + i,
    name: s.name,
    headline: s.headline,
    description: s.description,
    imageUrl: "",
    order: i,
    createdAt: 1000 - i,
  }));
}

export async function getLeadership(): Promise<LeaderDoc[]> {
  const live = await readCollection<LeaderDoc>(COL.leadership);
  if (live && live.length) return live.sort((a, b) => a.order - b.order);
  return seed.roster.map((r, i) => ({
    id: "seed-" + i,
    name: r.name,
    position: r.role,
    major: "",
    description: r.duty,
    imageUrl: "",
    order: i,
    createdAt: 1000 - i,
  }));
}

export async function getGallery(): Promise<GalleryDoc[]> {
  const live = await readCollection<GalleryDoc>(COL.gallery);
  if (live && live.length) return live.sort((a, b) => a.order - b.order);
  return seed.gallery.map((g, i) => ({
    id: "seed-" + i,
    caption: g.caption,
    imageUrl: "",
    order: i,
    createdAt: 1000 - i,
    c1: g.c1,
    c2: g.c2,
    ratio: g.ratio,
  }));
}

export async function getImageSlots(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (!fdb.enabled) return out;
  try {
    const docs = (await fdb.list(COL.images)) || [];
    for (const d of docs) {
      const data = d as unknown as ImageSlotDoc & { id: string };
      if (data?.url) out[d.id] = data.url;
    }
  } catch {}
  return out;
}
