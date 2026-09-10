import "server-only";
import { SignJWT, importPKCS8 } from "jose";

// Minimal Firestore client over the REST API. Used instead of firebase-admin
// because the Admin SDK bundles protobuf.js, which needs eval() and does not
// run on Cloudflare Workers. Only the handful of operations the app needs are
// implemented: list, get, add, set (merge), delete.

type Json = Record<string, unknown>;

function serviceAccount(): {
  client_email: string;
  private_key: string;
  project_id: string;
} | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const json = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    const sa = JSON.parse(json);
    if (sa.client_email && sa.private_key && sa.project_id) return sa;
    return null;
  } catch {
    return null;
  }
}

const SA = serviceAccount();
export const firestoreEnabled = Boolean(SA);
const PROJECT_ID =
  SA?.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ---- OAuth2 access token (JWT bearer grant), cached in-isolate ----
let cachedToken: { value: string; exp: number } | null = null;

async function accessToken(): Promise<string | null> {
  if (!SA) return null;
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 30 > now) return cachedToken.value;

  const key = await importPKCS8(SA.private_key, "RS256");
  const assertion = await new SignJWT({
    scope: "https://www.googleapis.com/auth/datastore",
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(SA.client_email)
    .setSubject(SA.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;
  cachedToken = {
    value: data.access_token,
    exp: now + (data.expires_in ?? 3600),
  };
  return cachedToken.value;
}

// ---- value encode / decode ----
function encodeValue(v: unknown): Json {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v)
      ? { integerValue: String(v) }
      : { doubleValue: v };
  }
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.map(encodeValue) } };
  }
  if (typeof v === "object") {
    return { mapValue: { fields: encodeFields(v as Json) } };
  }
  return { stringValue: String(v) };
}

function encodeFields(obj: Json): Json {
  const out: Json = {};
  for (const [k, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    out[k] = encodeValue(val);
  }
  return out;
}

function decodeValue(v: Json): unknown {
  if ("stringValue" in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) return v.timestampValue;
  if ("mapValue" in v)
    return decodeFields(((v.mapValue as Json)?.fields as Json) || {});
  if ("arrayValue" in v) {
    const values = ((v.arrayValue as Json)?.values as Json[]) || [];
    return values.map(decodeValue);
  }
  return null;
}

function decodeFields(fields: Json): Json {
  const out: Json = {};
  for (const [k, val] of Object.entries(fields)) {
    out[k] = decodeValue(val as Json);
  }
  return out;
}

function idFromName(name: string): string {
  return name.split("/").pop() || "";
}

async function authedFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response | null> {
  const token = await accessToken();
  if (!token) return null;
  const headers = new Headers(init.headers);
  headers.set("authorization", "Bearer " + token);
  if (init.body && !headers.has("content-type"))
    headers.set("content-type", "application/json");
  return fetch(path.startsWith("http") ? path : BASE + path, {
    ...init,
    headers,
  });
}

export type Doc = Json & { id: string };

export const fdb = {
  enabled: firestoreEnabled,

  async list(collection: string): Promise<Doc[] | null> {
    const out: Doc[] = [];
    let pageToken = "";
    for (let i = 0; i < 20; i++) {
      const qs = new URLSearchParams({ pageSize: "300" });
      if (pageToken) qs.set("pageToken", pageToken);
      const res = await authedFetch(`/${collection}?${qs.toString()}`);
      if (!res) return null;
      if (!res.ok) return res.status === 404 ? [] : null;
      const data = (await res.json()) as {
        documents?: Array<{ name: string; fields?: Json }>;
        nextPageToken?: string;
      };
      for (const d of data.documents || []) {
        out.push({ id: idFromName(d.name), ...decodeFields(d.fields || {}) });
      }
      if (!data.nextPageToken) break;
      pageToken = data.nextPageToken;
    }
    return out;
  },

  async get(collection: string, id: string): Promise<Doc | null> {
    const res = await authedFetch(`/${collection}/${encodeURIComponent(id)}`);
    if (!res || !res.ok) return null;
    const d = (await res.json()) as { name: string; fields?: Json };
    return { id: idFromName(d.name), ...decodeFields(d.fields || {}) };
  },

  async add(collection: string, data: Json): Promise<Doc | null> {
    const res = await authedFetch(`/${collection}`, {
      method: "POST",
      body: JSON.stringify({ fields: encodeFields(data) }),
    });
    if (!res || !res.ok) return null;
    const d = (await res.json()) as { name: string };
    return { id: idFromName(d.name), ...data };
  },

  // Merge semantics: only the provided keys are written.
  async set(collection: string, id: string, data: Json): Promise<boolean> {
    const mask = Object.keys(data)
      .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
      .join("&");
    const res = await authedFetch(
      `/${collection}/${encodeURIComponent(id)}?${mask}`,
      { method: "PATCH", body: JSON.stringify({ fields: encodeFields(data) }) }
    );
    return Boolean(res && res.ok);
  },

  async del(collection: string, id: string): Promise<boolean> {
    const res = await authedFetch(`/${collection}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return Boolean(res && res.ok);
  },
};
