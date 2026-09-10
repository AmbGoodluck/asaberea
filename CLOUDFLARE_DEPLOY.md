# Cloudflare deployment

**Live:** https://asaberea.jallohosmanamadu311.workers.dev
Worker name: `asaberea` · account: `jallohosmanamadu311@gmail.com`

Runs on Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`), Next.js 15
with `nodejs_compat`.

## Redeploying

```bash
npm run cf:deploy      # build + deploy
npm run cf:preview     # build + run locally on workerd (http://localhost:8787)
```

`git push` does **not** auto-deploy. Run `npm run cf:deploy` after changes, or
connect the GitHub repo in the Cloudflare dashboard (Workers > asaberea >
Settings > Build) for push-to-deploy.

## Why there is no firebase-admin

`firebase-admin` bundles protobuf.js, which calls `eval()` and is rejected by
the Workers runtime (`EvalError: Code generation from strings disallowed`).
So this project talks to Google directly:

- `src/lib/firestore-rest.ts` a small Firestore REST client. It mints a Google
  OAuth token with a `jose`-signed JWT (service-account key) and calls the
  Firestore v1 REST API for list / get / add / set / delete.
- `src/lib/verify-token.ts` verifies Firebase ID tokens with `jose` against
  Google's public keys.
- `src/lib/firebase/client.ts` no `firebase/firestore` import (it also pulls
  protobuf.js). The admin UI only uses `firebase/auth` and `firebase/storage`.

`firebase-admin` stays in `package.json` only for the Node scripts
(`set-admins`, `import-gallery`), which never run on the Worker.

## Secrets (already set on the Worker)

```
FIREBASE_SERVICE_ACCOUNT   (base64 of the service-account JSON)
ADMIN_EMAILS               jallohosmanamadu311@gmail.com,jalloho@berea.edu
```

`NEXT_PUBLIC_FIREBASE_*` are inlined from `.env.local` at build time, so they
must be present when you run `npm run cf:deploy`. To rotate a secret:

```bash
printf '%s' "NEW_VALUE" | npx wrangler secret put FIREBASE_SERVICE_ACCOUNT
```

## Custom domain (later)

Cloudflare dashboard > Workers & Pages > asaberea > Settings > Domains & Routes
> Add > enter `asaberea.org` (or a subdomain). Then add that domain under
**Firebase Console > Authentication > Settings > Authorized domains**.

## Known warnings (harmless)

- `Failed to copy .../data-uri-to-buffer` during build a stray transitive file.
- esbuild `-0` equality warnings from bundled libraries.
