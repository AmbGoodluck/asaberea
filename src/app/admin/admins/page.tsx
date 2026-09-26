"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";

type Added = { id: string; email: string; role?: string; addedBy?: string; createdAt?: number };

export default function AdminsPage() {
  const { authedFetch } = useAdmin();
  const [owners, setOwners] = useState<string[]>([]);
  const [admins, setAdmins] = useState<Added[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await authedFetch("/api/admin/admins");
      if (res.ok) {
        const data = await res.json();
        setOwners(data.owners || []);
        setAdmins(data.admins || []);
      }
    } finally {
      setLoading(false);
    }
  }, [authedFetch]);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await authedFetch("/api/admin/admins", {
        method: "POST",
        body: JSON.stringify({ email: clean, role: role.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setEmail("");
        setRole("");
        setMsg({ kind: "ok", text: `Added ${clean}. They can now sign in with Google.` });
        await load();
      } else {
        setMsg({ kind: "err", text: data.message || "Could not add that email. Check it and try again." });
      }
    } catch {
      setMsg({ kind: "err", text: "Something went wrong. Try again." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(target: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await authedFetch(`/api/admin/admins?email=${encodeURIComponent(target)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ kind: "ok", text: `Removed ${target}.` });
        await load();
      } else {
        setMsg({ kind: "err", text: data.message || "Could not remove that admin." });
      }
    } catch {
      setMsg({ kind: "err", text: "Something went wrong. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="a-head">
        <div>
          <h1>Admins</h1>
          <p>Give a trusted person, like the president, access to this portal by adding their email. They sign in with that Google account and manage the site with you.</p>
        </div>
      </div>

      <div className="a-card" style={{ marginBottom: 26 }}>
        <h3>Add an admin</h3>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "-8px 0 16px", lineHeight: 1.55 }}>
          Use the Google email they will sign in with. Access takes effect immediately, no redeploy needed.
        </p>
        <form className="a-form" onSubmit={add}>
          <div className="a-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="president@gmail.com"
              disabled={busy}
              required
            />
          </div>
          <div className="a-field">
            <label>Role (optional)</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="President"
              maxLength={80}
              disabled={busy}
            />
          </div>
          <div className="a-form-actions">
            <button className="a-btn primary" type="submit" disabled={busy}>
              {busy ? "Working..." : "Add admin"}
            </button>
          </div>
        </form>
        {msg && (
          <div className={"a-msg" + (msg.kind === "err" ? " err" : "")} style={{ display: "block", marginTop: 12 }}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="a-card">
        <h3>Who has access</h3>
        {loading ? (
          <div className="a-empty">Loading...</div>
        ) : (
          <div className="admins-list">
            {owners.map((o) => (
              <div className="admins-row" key={"owner-" + o}>
                <div>
                  <div className="admins-email">{o}</div>
                  <div className="admins-sub">Owner, set in site config</div>
                </div>
                <span className="admins-badge owner">Permanent</span>
              </div>
            ))}
            {admins.map((a) => (
              <div className="admins-row" key={a.id}>
                <div>
                  <div className="admins-email">{a.email}</div>
                  <div className="admins-sub">
                    {a.role ? a.role + " · " : ""}Added{a.addedBy ? " by " + a.addedBy : ""}
                  </div>
                </div>
                <button className="a-btn ghost sm" onClick={() => remove(a.email)} disabled={busy}>
                  Remove
                </button>
              </div>
            ))}
            {owners.length === 0 && admins.length === 0 && (
              <div className="a-empty">No admins yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
