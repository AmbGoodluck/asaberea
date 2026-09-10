# Deploying to Cloudflare

This app is wired for **Cloudflare Workers via OpenNext**
(`@opennextjs/cloudflare`). It runs Next.js with Node.js compatibility so the
public site and the `/api` admin backend both work on Cloudflare.

## What is already set up

- `open-next.config.ts`, `wrangler.jsonc` (name `asaberea`, `nodejs_compat`)
- `next.config.mjs` calls `initOpenNextCloudflareForDev()` for local dev
- Firestore uses the **REST transport** (`preferRest`), required on Workers
  (`src/lib/firebase/admin.ts`)
- Firebase **ID tokens are verified with `jose`** (`src/lib/verify-token.ts`),
  not the `firebase-admin/auth` module, which does not bundle for Workers
- Scripts in `package.json`:
  - `npm run cf:build` build the Worker into `.open-next/`
  - `npm run cf:preview` build + run it locally on `workerd`
  - `npm run cf:deploy` build + deploy
  - `npm run cf:typegen` regenerate `cloudflare-env.d.ts`

`npm run cf:build` and `npx wrangler deploy --dry-run` both pass. The bundle is
~1.9 MB gzip (under the limit).

## One-time deploy steps

1. `npm install` (gets `@opennextjs/cloudflare`, `wrangler`, `jose`)
2. `npx wrangler login` and pick the ASA Cloudflare account
3. Push the env vars to the Worker (same values as `.env.local`):
   ```bash
   npx wrangler secret put FIREBASE_SERVICE_ACCOUNT   # paste the base64
   npx wrangler secret put ADMIN_EMAILS               # jallohosmanamadu311@gmail.com,...
   ```
   The `NEXT_PUBLIC_FIREBASE_*` values can be secrets too, or plain vars added
   under **Workers > asaberea > Settings > Variables** in the dashboard. They
   must be present at build time as well, so keep them in `.env.local` locally
   and add them to the CI/deploy environment.
4. `npm run cf:deploy`
5. In the **Firebase Console > Authentication > Settings > Authorized domains**,
   add the deployed domain (`asaberea.<subdomain>.workers.dev`, then your real
   domain once DNS is set).
6. Point the domain: Cloudflare dashboard > Workers > asaberea > Settings >
   Domains & Routes > add `asaberea.org` (or a subdomain).

## Local check before deploying

```bash
npm run cf:preview     # builds and serves the Worker on http://localhost:8787
```

Test `/`, `/events`, an event page, `/contact`, and `/admin` (sign-in +
one save on each tab). This exercises the same runtime Cloudflare uses.

## Known warnings (safe to ignore)

- `Failed to copy .../data-uri-to-buffer` during `cf:build` a transitive
  `node-fetch` file. `gaxios` uses the global `fetch` on Workers, so it is not
  needed at runtime. If Firestore ever fails to authenticate on Cloudflare,
  revisit this first.
- esbuild `-0` / floating-point equality warnings from bundled libraries.

## Alternative: Vercel

Vercel runs the Node runtime these routes use with zero extra config. Import
the GitHub repo, add the `.env.local` variables in Project Settings, deploy.
Nothing in the code is Vercel-specific.
