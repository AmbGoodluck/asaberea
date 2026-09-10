import "server-only";
import { adminDb } from "./firebase/admin";
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

// Content getters. When the Admin SDK is configured they read live data from
// Firestore; otherwise they return the seed content so the public site is
// fully functional before Firebase is connected.

async function readCollection<T>(name: string): Promise<T[] | null> {
  const db = adminDb();
  if (!db) return null;
  try {
    const snap = await db.collection(name).get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as T[];
  } catch {
    return null;
  }
}

export async function getStats(): Promise<StatsDoc> {
  const db = adminDb();
  if (db) {
    try {
      const doc = await db.collection(COL.stats).doc(STATS_DOC).get();
      if (doc.exists) return doc.data() as StatsDoc;
    } catch {}
  }
  return { nations: 9, eventsPerYear: 24, ecLeaders: 10, joinPrice: 6 };
}

export async function getEvents(): Promise<EventDoc[]> {
  const live = await readCollection<EventDoc>(COL.events);
  if (live && live.length) return live.sort((a, b) => b.createdAt - a.createdAt);
  return seed.events.map((e, i) => ({
    id: "seed-" + i,
    title: e.title,
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
    name: "Position open",
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
  const db = adminDb();
  const out: Record<string, string> = {};
  if (!db) return out;
  try {
    const snap = await db.collection(COL.images).get();
    snap.docs.forEach((d) => {
      const data = d.data() as ImageSlotDoc;
      if (data?.url) out[d.id] = data.url;
    });
  } catch {}
  return out;
}
