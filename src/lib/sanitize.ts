// Lightweight input sanitization for plain-text fields.
// All user text is stored and rendered as plain text (React escapes on
// render). We strip control characters (keeping tab and newline), drop HTML
// angle brackets as defense-in-depth, collapse excessive whitespace, and cap
// length.

export function sanitizeText(input: unknown, max = 4000): string {
  if (typeof input !== "string") return "";
  const normalized = input.normalize("NFC");
  let out = "";
  for (const ch of normalized) {
    const c = ch.codePointAt(0) ?? 0;
    if (c === 9 || c === 10) {
      out += ch; // keep tab and newline
      continue;
    }
    if (c < 32 || (c >= 127 && c <= 159)) continue; // strip control chars
    out += ch;
  }
  out = out
    .replace(/[<>]/g, "")
    .replace(/[ \t]{3,}/g, "  ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
  if (out.length > max) out = out.slice(0, max);
  return out;
}

// Sanitize the string values of a plain object (shallow).
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = typeof v === "string" ? sanitizeText(v) : v;
  }
  return result as T;
}
