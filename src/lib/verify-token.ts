import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

// Verifies a Firebase Auth ID token without the firebase-admin auth module,
// so it runs on any runtime (Node, Cloudflare Workers, edge). Firebase ID
// tokens are RS256, signed by Google's securetoken service account.

const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  "";

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export type VerifiedUser = { uid: string; email: string | null };

export async function verifyFirebaseIdToken(
  token: string
): Promise<VerifiedUser | null> {
  if (!token || !PROJECT_ID) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
      algorithms: ["RS256"],
    });
    // Firebase-specific: sub is the uid and must be non-empty; auth_time in past.
    const uid = typeof payload.sub === "string" ? payload.sub : "";
    if (!uid) return null;
    const authTime = payload.auth_time;
    if (typeof authTime === "number" && authTime * 1000 > Date.now() + 5000) {
      return null;
    }
    const email =
      typeof payload.email === "string" ? payload.email.toLowerCase() : null;
    return { uid, email };
  } catch {
    return null;
  }
}
