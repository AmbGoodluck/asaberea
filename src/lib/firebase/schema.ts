import { z } from "zod";

// ---- Collection names (single source of truth) ----
export const COL = {
  events: "events",
  spotlights: "spotlights",
  leadership: "leadership",
  gallery: "gallery",
  images: "images",
  contacts: "contacts",
  stats: "stats",
} as const;

export const STATS_DOC = "current";

// ---- Document types ----
export type EventDoc = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string; // ISO date, e.g. 2026-09-14
  time: string; // free text, e.g. "6:00 PM"
  venue: string;
  link: string;
  category: "Cultural" | "Social" | "Meeting" | "Panel";
  isPast: boolean;
  createdAt: number;
  c1?: string; // gradient fallback when no imageUrl
  c2?: string;
};

export type SpotlightDoc = {
  id: string;
  name: string;
  headline: string; // accomplishment / talent
  description: string;
  imageUrl: string;
  order: number;
  createdAt: number;
};

export type LeaderDoc = {
  id: string;
  name: string;
  position: string;
  major: string;
  description: string;
  imageUrl: string;
  order: number;
  createdAt: number;
};

export type GalleryDoc = {
  id: string;
  caption: string;
  imageUrl: string;
  order: number;
  createdAt: number;
  c1?: string; // gradient fallback when no imageUrl
  c2?: string;
  ratio?: number;
};

export type StatsDoc = {
  nations: number;
  eventsPerYear: number;
  ecLeaders: number;
  joinPrice: number;
};

export type ContactDoc = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: number;
};

// Named image slots the admin can replace per page.
export const IMAGE_SLOTS = [
  { id: "about-hero", label: "About page hero" },
  { id: "about-story", label: "About story image" },
  { id: "spotlight-feature", label: "Home spotlight feature" },
  { id: "contact-side", label: "Contact page image" },
  { id: "og-share", label: "Social share image" },
] as const;

export type ImageSlotDoc = { url: string; updatedAt: number };

// ---- Validation (zod) for admin inputs ----
const short = z.string().trim().min(1).max(160);
const long = z.string().trim().min(1).max(4000);
const url = z.string().trim().url().max(1000).or(z.literal(""));

export const eventInput = z.object({
  title: short,
  description: long,
  imageUrl: url,
  date: z.string().trim().max(40),
  time: z.string().trim().max(40),
  venue: z.string().trim().max(120).default(""),
  link: url.default(""),
  category: z.enum(["Cultural", "Social", "Meeting", "Panel"]).default("Cultural"),
  isPast: z.boolean().default(false),
});

export const spotlightInput = z.object({
  name: short,
  headline: short,
  description: z.string().trim().max(1200).default(""),
  imageUrl: url,
  order: z.number().int().min(0).max(9999).default(0),
});

export const leaderInput = z.object({
  name: short,
  position: short,
  major: z.string().trim().max(120).default(""),
  description: z.string().trim().max(1200).default(""),
  imageUrl: url,
  order: z.number().int().min(0).max(9999).default(0),
});

export const galleryInput = z.object({
  caption: z.string().trim().max(160).default(""),
  imageUrl: url,
  order: z.number().int().min(0).max(9999).default(0),
});

export const statsInput = z.object({
  nations: z.number().int().min(0).max(100000),
  eventsPerYear: z.number().int().min(0).max(100000),
  ecLeaders: z.number().int().min(0).max(100000),
  joinPrice: z.number().int().min(0).max(100000),
});

export const imageSlotInput = z.object({
  slot: z.string().trim().min(1).max(60),
  url: z.string().trim().url().max(1000),
});

// Public contact form
export const contactInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().max(160).default(""),
  message: z.string().trim().min(1).max(4000),
});

export type EventInput = z.infer<typeof eventInput>;
export type SpotlightInput = z.infer<typeof spotlightInput>;
export type LeaderInput = z.infer<typeof leaderInput>;
export type GalleryInput = z.infer<typeof galleryInput>;
export type StatsInput = z.infer<typeof statsInput>;
export type ContactInput = z.infer<typeof contactInput>;
