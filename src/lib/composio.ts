// ============================================================
// Composio integration layer (stub)
// ------------------------------------------------------------
// The site currently reads content from lib/data.ts. When the
// admin portal is wired up, Composio becomes the bridge between
// the EC's dashboard actions and this site's content.
//
// Swap the imports in each page from `@/lib/data` to these
// async getters, and implement the fetches here. Shapes match
// the types exported from lib/data.ts, so pages don't change.
//
// No secrets in this file — the key lives in .env.local as
// COMPOSIO_API_KEY and is only ever read server-side.
// ============================================================

import {
  events as staticEvents,
  stories as staticStories,
  roster as staticRoster,
  products as staticProducts,
  gallery as staticGallery,
  type EventItem,
  type Story,
  type Role,
  type Product,
  type GalleryItem,
} from "./data";

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
export const composioReady = Boolean(COMPOSIO_API_KEY);

// Until Composio is connected, every getter returns the local
// content so the site is fully functional for the team demo.

export async function getEvents(): Promise<EventItem[]> {
  // TODO: fetch via Composio when composioReady
  return staticEvents;
}

export async function getStories(): Promise<Story[]> {
  return staticStories;
}

export async function getRoster(): Promise<Role[]> {
  return staticRoster;
}

export async function getProducts(): Promise<Product[]> {
  return staticProducts;
}

export async function getGallery(): Promise<GalleryItem[]> {
  return staticGallery;
}
