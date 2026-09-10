# Deploying to Cloudflare

Short version: this app uses **server API routes with the Firebase Admin SDK**
(`/api/admin/*`, `/api/contact`). That runs on a Node.js server. Cloudflare has
two ways to host Next.js and they behave very differently here.

## The catch

| Route | Needs |
| --- | --- |
| Public pages (`/`, `/events`, `/about`, ...) | anything, they are static / ISR |
| `/api/admin/*`, `/api/contact` | Node.js runtime + `firebase-admin` |

`firebase-admin` does **not** run on Cloudflare's plain edge runtime. So
`@cloudflare/next-on-pages` (the "Pages" adapter) is **not** an option without
rewriting the whole admin backend to edge code. Don't go that route.

## Recommended: Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)

This runs Next.js with Node.js compatibility (`nodejs_compat`), so
`firebase-admin` works. The code already sets `preferRest: true` on Firestore
(`src/lib/firebase/admin.ts`) which is what makes the Admin SDK work there.

**It requires Next.js 15.** This project is on Next 14. So the steps are:

1. Upgrade Next: `npm i next@15 react@19 react-dom@19` and run the codemod
   `npx @next/codemod@latest upgrade latest`. Test `npm run build` and every
   admin tab locally. (Ask me to do this as one focused change.)
2. Add the adapter:
   ```bash
   npm i -D @opennextjs/cloudflare wrangler
   ```
3. Add `wrangler.jsonc`:
   ```jsonc
   {
     "name": "asaberea",
     "main": ".open-next/worker.js",
     "compatibility_date": "2025-03-01",
     "compatibility_flags": ["nodejs_compat"],
     "assets": { "directory": ".open-next/assets", "binding": "ASSETS" }
   }
   ```
4. Add `open-next.config.ts`:
   ```ts
   import { defineCloudflareConfig } from "@opennextjs/cloudflare";
   export default defineCloudflareConfig();
   ```
5. `package.json` scripts:
   ```json
   "cf:build": "opennextjs-cloudflare build",
   "cf:deploy": "opennextjs-cloudflare build && wrangler deploy",
   "cf:preview": "opennextjs-cloudflare build && wrangler dev"
   ```
6. In the Cloudflare dashboard (Workers project) or via `wrangler secret put`,
   add every variable from `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_*` (plain vars)
   - `FIREBASE_SERVICE_ACCOUNT` (secret)
   - `ADMIN_EMAILS` (plain var)
7. `npm run cf:deploy`. Add the deployed domain under
   **Firebase Console > Authentication > Settings > Authorized domains**.

## Fastest path if you need it live now

Deploy to **Vercel** with zero code changes (it supports the Node runtime the
admin routes use). Import the GitHub repo, paste the same env vars, done. You
can move to Cloudflare later with the steps above.

## What is already done for Cloudflare

- `src/lib/firebase/admin.ts` uses the Firestore REST transport (`preferRest`),
  required on Workers.
- `.gitignore` covers `.dev.vars` and `.wrangler/`.
- Security headers in `next.config.mjs` are host-agnostic and work on both.
