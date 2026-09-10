# ASA Berea

Website and admin portal for the **African Students Association (ASA)** at
Berea College. Built with **Next.js 15 (App Router)** and **TypeScript**, with
**Firebase** (Auth + Firestore) powering a no-code admin portal at `/admin`.
Images live in a **Cloudflare R2** bucket, served from `/media/<key>`.

The public site works on seed content out of the box. Add your Firebase keys
and it becomes fully live and admin-managed, with no code changes to the pages.

## Public pages

`/` Home (animated Africa hero, live event gallery, stats, pillars, member
spotlight) · `/about` · `/events` and per-event pages at `/events/<slug>` ·
`/leadership` · `/gallery` · `/store` · `/contact` (writes to the admin inbox).

Every "Become a member" / "Join ASA" button links to the CampusGroups signup
(`src/lib/links.ts`).

Deploy notes: [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md),
[`CLOUDFLARE_DEPLOY.md`](./CLOUDFLARE_DEPLOY.md).

## Admin portal (`/admin`)

Sign in with an authorized Google account. Tabs:

- **Events** name, description, flyer, date, time, venue, link, and an
  upcoming/past toggle. Past events move to the archive automatically.
- **Stats** the four homepage figures (nations, events a year, EC leaders, dues).
  Free text, so "24+" or "over 25" work, not just plain numbers.
- **Spotlight** feature students and accomplishments (shown on the homepage).
- **Leadership** the Executive Committee roster (name, position, major, photo).
- **Images** swap the hero and page images, and manage the photo gallery.
- **Inbox** read and manage contact-form submissions.

## Setup

1. Install and run:

   ```bash
   npm install
   cp .env.example .env.local   # then fill in the values
   npm run dev                  # http://localhost:3000
   ```

2. **Firebase keys.** Follow [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) for the
   full walkthrough (which console screen, which file, which variable). In short:
   - Project settings → General → Your apps → copy the web config into the
     `NEXT_PUBLIC_FIREBASE_*` values in `.env.local`.
   - Project settings → Service accounts → Generate new private key → base64 the
     JSON into `FIREBASE_SERVICE_ACCOUNT` (server-only).
   - Authentication → Sign-in method → enable **Google**.
   - Put admin emails in `ADMIN_EMAILS` (comma-separated).

3. **Grant admin rights.** Each admin signs in once at `/admin`, then run:

   ```bash
   npm run set-admins
   ```

   This sets the `admin` custom claim used by the security rules.

4. **Deploy the security rules** (needs the Firebase CLI, `npm i -g firebase-tools`):

   ```bash
   firebase deploy --only firestore:rules
   ```

## Security

- All content writes go through server API routes that verify the Firebase ID
  token (RS256, checked with `jose` against Google's public keys, so it runs on
  any runtime) and the admin allowlist; direct client writes are denied by the
  rules.
- The contact endpoint is rate limited (5 requests / 10 min per IP), sanitizes
  and validates every field (zod), and includes a honeypot for bots.
- Every admin API route is rate limited per IP (writes 40/min, reads 120/min)
  on top of the token + allowlist check.
- Security headers are set for every response in `next.config.mjs`:
  Content-Security-Policy (scoped to Next, Google Fonts, and Firebase),
  HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, and a locked-down `Permissions-Policy`.
- The contact inbox is never client-readable; it is server-only.
- Image uploads go through `/api/admin/upload` / `/api/admin/gallery` (admin
  only, image types, under 20 MB) into the R2 bucket; `/media/<key>` serves
  them read-only.
- No secrets are committed. Only `NEXT_PUBLIC_*` values reach the browser.

## Project structure

```
src/
  app/
    (site)/            public pages (share the site chrome)
    admin/             admin portal (own chrome, auth-gated)
    api/               contact + admin API routes (server, secured)
    globals.css        design system
  components/          Nav, Footer, hero, cards, admin UI
  lib/
    firebase/          client SDK + schema/zod; firestore-rest.ts (Admin over REST)
    content.ts         reads Firestore, falls back to seed data
    data.ts            seed content
    sanitize.ts, ratelimit.ts, auth-guard.ts
firestore.rules, firebase.json
open-next.config.ts, wrangler.jsonc          Cloudflare Workers deploy
scripts/
  set-admin-claims.mjs      grant the admin custom claim
  import-gallery.mjs         bulk-import event photos into the gallery
```

## Importing past-event photos

```bash
# from a folder on your computer (handles subfolders):
npm run import-gallery -- ~/Downloads/eventsphotos

# from a PUBLIC Box link (only if it needs no sign-in):
npm run import-gallery -- --box https://berea.box.com/v/eventsphotos

# preview without uploading:
npm run import-gallery -- ~/Downloads/eventsphotos --dry
```

Each image is uploaded to the R2 bucket (via `wrangler`, so it uses your
`wrangler login`) and added to the `gallery` collection, so it appears on
`/gallery` and the homepage strip. Re-running skips photos already imported.

## Design

Warm kente-derived palette driven by CSS custom properties in `globals.css`,
full dark mode, Newsreader display serif paired with the system UI font, and
an animated SVG Africa motif on the homepage hero.
