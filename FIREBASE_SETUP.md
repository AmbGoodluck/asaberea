# Firebase setup, step by step

This project runs on **seed content with no Firebase**. Add the keys below and
the public site becomes live and fully managed from `/admin`, with no code
changes. Nothing here is committed to git.

---

## 0. What you end up with

| File | Purpose | Committed? |
| --- | --- | --- |
| `.env.local` (project root) | All Firebase keys + the admin allowlist | **No** (git-ignored) |
| `serviceAccountKey.json` (anywhere outside the repo, e.g. `~/asa-secrets/`) | The raw service-account file you download from Firebase. Only used to copy its contents into `.env.local`. | **No** (keep it out of the repo) |

The app **never reads a JSON file at runtime.** It reads one environment
variable, `FIREBASE_SERVICE_ACCOUNT`, which holds the JSON as a string. So the
downloaded file is just a stopover.

---

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> and click **Add project**.
2. Name it `asa-berea` (or anything). Google Analytics is optional; you can skip it.
3. Wait for it to finish provisioning, then open the project.

## 2. Turn on the three services

**Authentication**
1. Left sidebar, **Build > Authentication > Get started**.
2. **Sign-in method** tab > **Add new provider > Google > Enable > Save**.
3. **Settings > Authorized domains** tab: add the domains the portal runs on.
   `localhost` is there by default. Add your production domain later
   (e.g. `asaberea.vercel.app` or `asaberea.org`).

**Firestore Database**
1. **Build > Firestore Database > Create database**.
2. Start in **Production mode** (we ship real rules, see step 6).
3. Pick the region closest to campus, e.g. `us-east1`. This cannot be changed later.

**Storage**
1. **Build > Storage > Get started**.
2. Accept the default bucket. Production mode is fine, rules come in step 6.

## 3. Get the web app config (the `NEXT_PUBLIC_*` keys)

1. Project **Settings** (gear icon, top left) **> General**.
2. Scroll to **Your apps > Web app** and click the `</>` icon. Nickname: `asa-web`.
   Do **not** enable Firebase Hosting here.
3. Firebase shows a `firebaseConfig` object. You need six values from it.

Create the file **`.env.local` in the project root** (same folder as `package.json`)
by copying `.env.example`:

```bash
cp .env.example .env.local
```

Then fill it in from `firebaseConfig`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy........................
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=asa-berea.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=asa-berea
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=asa-berea.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

(Mapping: `apiKey` -> API_KEY, `authDomain` -> AUTH_DOMAIN, `projectId` ->
PROJECT_ID, `storageBucket` -> STORAGE_BUCKET, `messagingSenderId` ->
MESSAGING_SENDER_ID, `appId` -> APP_ID.)

## 4. Get the service-account key (the server credential)

1. Project **Settings > Service accounts** tab.
2. Click **Generate new private key > Generate key**. A JSON file downloads,
   named like `asa-berea-firebase-adminsdk-xxxxx.json`.
3. **Move it out of this repo.** For example:

   ```bash
   mkdir -p ~/asa-secrets
   mv ~/Downloads/asa-berea-firebase-adminsdk-*.json ~/asa-secrets/serviceAccountKey.json
   ```

4. Put its contents into `.env.local` as a single line. Easiest is base64:

   ```bash
   # macOS
   base64 -i ~/asa-secrets/serviceAccountKey.json | pbcopy
   ```

   Then in `.env.local`:

   ```
   FIREBASE_SERVICE_ACCOUNT=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50Iiw...   # the long base64 string
   ```

   The code accepts either raw JSON on one line **or** base64. Base64 avoids
   quoting headaches with the newlines in `private_key`.

## 5. Set the admin allowlist

In the same `.env.local`:

```
ADMIN_EMAILS=jallohosmanamadu311@gmail.com,secondadmin@berea.edu
```

Comma-separated, no spaces needed. Only these Google accounts can enter `/admin`
and only these can write any content.

Restart the dev server after editing `.env.local`:

```bash
npm run dev
```

Visit <http://localhost:3000/admin> and sign in with Google.

## 6. Deploy the security rules

The repo already contains `firestore.rules` and `storage.rules`. Push them to Firebase:

```bash
npm i -g firebase-tools
firebase login
firebase use asa-berea            # your project id
firebase deploy --only firestore:rules,storage
```

What the rules enforce:
- Public content collections (`events`, `spotlights`, `leadership`, `gallery`,
  `images`, `stats`) are **read-only to the world, writable only by an admin**.
- The `contacts` inbox has **no client access at all**; it is written and read
  only by the server.
- Storage: uploads only by a signed-in admin, image MIME types only, under 6 MB.

## 7. Grant the `admin` custom claim

The Storage/Firestore rules check `request.auth.token.admin == true`. Grant it:

1. Each admin listed in `ADMIN_EMAILS` signs in once at `/admin` (this creates
   their Firebase user record).
2. Run:

   ```bash
   npm run set-admins
   ```

   This reads `FIREBASE_SERVICE_ACCOUNT` and `ADMIN_EMAILS` from `.env.local`
   and sets `{ admin: true }` on each user. Re-run it whenever you add an admin.
3. Admins sign out and back in once so the new claim is in their token.

## 8. Production (Vercel or similar)

Add the **same variables** from `.env.local` to the host's environment settings
(Project Settings > Environment Variables). `NEXT_PUBLIC_*` are safe to expose;
`FIREBASE_SERVICE_ACCOUNT` and `ADMIN_EMAILS` are server-only, do not prefix
them. Then add the production domain under
**Firebase Auth > Settings > Authorized domains**.

---

## Quick checklist

- [ ] Project created, Auth + Firestore + Storage enabled
- [ ] Google sign-in provider enabled
- [ ] `.env.local` created with 6 `NEXT_PUBLIC_FIREBASE_*` values
- [ ] `FIREBASE_SERVICE_ACCOUNT` set (base64 of the downloaded JSON)
- [ ] `ADMIN_EMAILS` set
- [ ] `firebase deploy --only firestore:rules,storage` run
- [ ] Each admin signed in once, then `npm run set-admins` run
- [ ] Same vars added to the production host
