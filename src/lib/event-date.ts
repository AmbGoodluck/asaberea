// Tolerant parser for the free-text date/time fields admins type in
// ("SEP 14", "6:00 PM") as well as ISO dates ("2026-09-14"), so events can
// be sorted chronologically without forcing a strict date picker on admins.

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function parseTimeOfDay(timeStr?: string): { h: number; m: number } {
  const t = (timeStr || "").trim();
  const m = t.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i);
  if (!m) return { h: 12, m: 0 };
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return { h, m: min };
}

export function parseEventDate(
  dateStr: string,
  timeStr?: string,
  fallback = 0
): number {
  const d = (dateStr || "").trim();
  if (!d) return fallback;

  // ISO: 2026-09-14
  let m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const { h, m: min } = parseTimeOfDay(timeStr);
    const t = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), h, min).getTime();
    return Number.isNaN(t) ? fallback : t;
  }

  // "SEP 14", "September 14", optionally with ", 2026"
  m = d.match(/^([A-Za-z]{3,})\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?/);
  if (m) {
    const mon = MONTHS[m[1].slice(0, 3).toLowerCase()];
    if (mon !== undefined) {
      const year = m[3] ? Number(m[3]) : new Date().getFullYear();
      const { h, m: min } = parseTimeOfDay(timeStr);
      const t = new Date(year, mon, Number(m[2]), h, min).getTime();
      return Number.isNaN(t) ? fallback : t;
    }
  }

  const parsed = Date.parse(d);
  return Number.isNaN(parsed) ? fallback : parsed;
}
