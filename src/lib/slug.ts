// URL slug helper. "Welcome Mixer 2026" -> "welcome-mixer-2026".
// Kept ASCII-only and short so links like /events/mixer2026 stay clean.
export function slugify(input: string): string {
  return (input || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
