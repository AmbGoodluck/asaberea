# Deployment

This site runs on Cloudflare Workers and deploys automatically on every push to
`master` via Cloudflare Workers Builds.

- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx wrangler deploy`

Runtime configuration lives in the Cloudflare dashboard, not in the repo:

- Secrets: `ADMIN_EMAILS` (owner allowlist), `FIREBASE_SERVICE_ACCOUNT`
- R2 buckets: `asaberea-media` (uploads), `asaberea-cache` (Next cache)

Additional admins are added from the site's `/admin` -> Admins tab and take
effect without a redeploy.
