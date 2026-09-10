import type { MetadataRoute } from "next";
import { getEvents } from "@/lib/content";

const BASE = "https://asaberea.org";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/about", "/events", "/leadership", "/gallery", "/store", "/contact"];
  const now = new Date();

  const pages: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: p === "" || p === "/events" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  try {
    const events = await getEvents();
    for (const e of events) {
      if (!e.slug) continue;
      pages.push({
        url: `${BASE}/events/${e.slug}`,
        lastModified: e.createdAt ? new Date(e.createdAt) : now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    // fall back to static pages only
  }

  return pages;
}
