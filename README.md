# ASA Berea — Website

The website for the **African Students Association (ASA)** at Berea College.
Built with **Next.js 14 (App Router)** + **TypeScript**. No database yet —
content lives in `src/lib/data.ts` and is designed to be swapped for a live
admin-managed source (via Composio) with zero changes to the pages.

## Pages

| Route | Page |
| --- | --- |
| `/` | Home — animated hero, draggable event gallery, stats, pillars, join |
| `/about` | Mission, the four awareness pillars, how membership works |
| `/stories` | Blog & Stories — featured post + filterable grid |
| `/events` | Upcoming + past events, filterable by category |
| `/leadership` | The 10 Executive Committee roles (from the ASA constitution) |
| `/gallery` | Photo wall with lightbox |
| `/store` | Merch showcase with external checkout |

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## Project structure

```
src/
  app/                 # routes (App Router) + globals.css design system
  components/          # Nav, Footer, EventReel, cards, client interactions
  lib/
    data.ts            # all content (single source of truth for now)
    composio.ts        # integration layer stub — swap data.ts -> async getters here
public/logo.png        # ASA roundel
```

## Design system

Everything is driven by CSS custom properties in `src/app/globals.css`
(the `:root` block), with a full dark-mode palette. Brand colors are pulled
from the ASA logo: warm paper `#F1EBDE`, ink `#1F1810`, and kente accents —
rust `#B23A20`, gold `#C89127`, teal `#0C6B63`, plum `#4A163B`.
Type pairs **Newsreader** (display serif) with the system UI font.

## Next steps

- **Photos** — drop real event photos into `public/` and reference them from
  `src/lib/data.ts` (replace the gradient placeholders).
- **Admin + Composio** — implement the getters in `src/lib/composio.ts` and
  switch page imports from `@/lib/data` to `@/lib/composio`.
- **Store checkout** — set `NEXT_PUBLIC_STORE_CHECKOUT_BASE` to your Stripe
  payment link base.
- **Instagram feed** — wire the live feed on Home + footer (Phase 3).

## Environment

Copy `.env.example` to `.env.local` and fill in as integrations come online.
No secrets are committed.
