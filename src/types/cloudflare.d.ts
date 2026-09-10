// Minimal Cloudflare Workers types the app touches. The full set comes from
// `wrangler types`, but that generated file overrides lib.dom (Response, fetch,
// ...) which breaks a DOM-first Next.js project. We only need R2 here.

interface R2Object {
  body: ReadableStream | null;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
}

interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream | string,
    options?: {
      httpMetadata?: { contentType?: string; cacheControl?: string };
    }
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
}
