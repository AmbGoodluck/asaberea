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
  slug: string; // URL segment, e.g. /events/mixer2026
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
  w?: number; // natural pixel width, when known (no layout shift)
  h?: number; // natural pixel height
  blur?: string; // tiny blurred data URI for a smooth load
  c1?: string; // gradient fallback when no imageUrl
  c2?: string;
  ratio?: number;
};

// Free-text so values like "24+", "over 25", or "9" all work.
export type StatsDoc = {
  nations: string;
  eventsPerYear: string;
  ecLeaders: string;
  joinPrice: string;
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
  { id: "home-hero", label: "Home page hero image (optional backdrop)" },
  { id: "about-hero", label: "About page hero" },
  { id: "about-story", label: "About story image" },
  { id: "spotlight-feature", label: "Home spotlight feature" },
  { id: "contact-side", label: "Contact page image" },
  { id: "og-share", label: "Social share image" },
] as const;

export type ImageSlotDoc = { url: string; updatedAt: number };

// ---- Validation (zod) for admin inputs ----
const short = z.string().trim().min(1, "This is required").max(160, "That's too long");
const long = z.string().trim().min(1, "This is required").max(4000, "That's too long");

// Fields set by the photo uploader: either empty, or our own /media/...
// path, or (rarely) a full link someone pastes in directly. Not typed by
// hand in normal use, so this only guards against something going wrong.
const photo = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v),
    "Something went wrong with that photo. Try uploading it again."
  );

// A link a person types in by hand: accepts a bare domain
// ("berea.campusgroups.com/x") and adds https:// for them, but still
// rejects plain text (spaces, no dot) with a plain-language message.
const typedLink = z.preprocess((val) => {
  if (typeof val !== "string") return val;
  const v = val.trim();
  if (!v || /^https?:\/\//i.test(v) || /\s/.test(v) || !v.includes(".")) return v;
  return "https://" + v;
}, z.string().trim().max(1000).refine(
  (v) => v === "" || /^https?:\/\//i.test(v),
  "This should be a web link, like berea.campusgroups.com/event"
));

export const eventInput = z.object({
  title: short,
  slug: z.string().trim().max(80).regex(/^[a-z0-9-]*$/, "lowercase letters, numbers and hyphens only, no spaces").default(""),
  description: long,
  imageUrl: photo,
  date: z.string().trim().max(40),
  time: z.string().trim().max(40),
  venue: z.string().trim().max(120).default(""),
  link: typedLink.default(""),
  category: z.enum(["Cultural", "Social", "Meeting", "Panel"]).default("Cultural"),
  isPast: z.boolean().default(false),
});

export const spotlightInput = z.object({
  name: short,
  headline: short,
  description: z.string().trim().max(1200).default(""),
  imageUrl: photo,
  order: z.number().int().min(0).max(9999).default(0),
});

export const leaderInput = z.object({
  name: short,
  position: short,
  major: z.string().trim().max(120).default(""),
  description: z.string().trim().max(1200).default(""),
  imageUrl: photo,
  order: z.number().int().min(0).max(9999).default(0),
});

export const galleryInput = z.object({
  caption: z.string().trim().max(160).default(""),
  imageUrl: photo,
  order: z.number().int().min(0).max(9999).default(0),
  w: z.number().int().min(0).max(100000).optional(),
  h: z.number().int().min(0).max(100000).optional(),
  blur: z.string().max(4000).optional(),
});

const statLine = z.string().trim().min(1).max(40);
export const statsInput = z.object({
  nations: statLine,
  eventsPerYear: statLine,
  ecLeaders: statLine,
  joinPrice: statLine,
});

export const imageSlotInput = z.object({
  slot: z.string().trim().min(1).max(60),
  url: photo,
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
