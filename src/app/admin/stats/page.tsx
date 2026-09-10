"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";

type Stats = { nations: number; eventsPerYear: number; ecLeaders: number; joinPrice: number };
const FIELDS: { key: keyof Stats; label: string }[] = [
  { key: "nations", label: "Nations on campus" },
  { key: "eventsPerYear", label: "Events a year" },
  { key: "ecLeaders", label: "EC leaders" },
  { key: "joinPrice", label: "To join ($)" },
];

export default function StatsAdmin() {
  const { authedFetch } = useAdmin();
  const [stats, setStats] = useState<Stats>({ nations: 0, eventsPerYear: 0, ecLeaders: 0, joinPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await authedFetch("/api/admin/stats");
        if (res.ok) setStats(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, [authedFetch]);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await authedFetch("/api/admin/stats", { method: "PUT", body: JSON.stringify(stats) });
      setMsg(res.ok ? "Saved. The homepage will update within a minute." : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="a-head">
        <div>
          <h1>Stats</h1>
          <p>The four numbers on the homepage. Change them any time.</p>
        </div>
      </div>
      <div className="a-card" style={{ maxWidth: 560 }}>
        {loading ? (
          <div className="a-empty">Loading...</div>
        ) : (
          <>
            <div className="a-stats-grid">
              {FIELDS.map((f) => (
                <div className="a-field" key={f.key}>
                  <label>{f.label}</label>
                  <input
                    type="number"
                    value={stats[f.key]}
                    onChange={(e) => setStats((s) => ({ ...s, [f.key]: Number(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
            <div className="a-form-actions">
              <button className="a-btn primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
              {msg && <span className="a-msg">{msg}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
