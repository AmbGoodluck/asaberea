"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";

type Msg = {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read?: boolean;
  createdAt?: number;
};

const BULK_BATCH = 25;

export default function InboxAdmin() {
  const { authedFetch } = useAdmin();
  const [items, setItems] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await authedFetch("/api/admin/collection/contacts");
      const data = await res.json();
      const list: Msg[] = Array.isArray(data.items) ? data.items : [];
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleRead(m: Msg) {
    await authedFetch(`/api/admin/collection/contacts/${m.id}`, {
      method: "PATCH",
      body: JSON.stringify({ read: !m.read }),
    });
    setItems((s) => s.map((x) => (x.id === m.id ? { ...x, read: !m.read } : x)));
  }
  async function remove(m: Msg) {
    if (!confirm("Delete this message?")) return;
    await authedFetch(`/api/admin/collection/contacts/${m.id}`, { method: "DELETE" });
    setSelected((s) => {
      const next = new Set(s);
      next.delete(m.id);
      return next;
    });
    setItems((s) => s.filter((x) => x.id !== m.id));
  }

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((s) => (s.size === items.length ? new Set() : new Set(items.map((i) => i.id))));
  }

  async function removeSelected() {
    const ids = Array.from(selected);
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} message${ids.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    setBulkBusy(true);
    for (let i = 0; i < ids.length; i += BULK_BATCH) {
      const batch = ids.slice(i, i + BULK_BATCH);
      try {
        await authedFetch("/api/admin/collection/contacts/bulk-delete", {
          method: "POST",
          body: JSON.stringify({ ids: batch }),
        });
      } catch {}
    }
    setBulkBusy(false);
    setSelected(new Set());
    await load();
  }

  const unread = items.filter((m) => !m.read).length;

  return (
    <div>
      <div className="a-head">
        <div>
          <h1>Inbox</h1>
          <p>{unread > 0 ? `${unread} unread message${unread === 1 ? "" : "s"}` : "Messages from the contact form."}</p>
        </div>
      </div>

      {loading ? (
        <div className="a-empty">Loading...</div>
      ) : items.length === 0 ? (
        <div className="a-card">
          <div className="a-empty">No messages yet. Submissions from the contact page will appear here.</div>
        </div>
      ) : (
        <>
          <div className="a-list-head">
            <div />
            <div className="a-list-bulk">
              <label className="a-toggle sm">
                <input
                  type="checkbox"
                  checked={selected.size > 0 && selected.size === items.length}
                  onChange={toggleAll}
                />
                <span>Select all</span>
              </label>
              <button
                className="a-btn danger sm"
                disabled={!selected.size || bulkBusy}
                onClick={removeSelected}
              >
                {bulkBusy ? "Deleting..." : `Delete selected${selected.size ? ` (${selected.size})` : ""}`}
              </button>
            </div>
          </div>
          <div className="inbox-list">
            {items.map((m) => (
              <div key={m.id} className={"inbox-item" + (m.read ? "" : " unread") + (selected.has(m.id) ? " sel" : "")}>
                <div className="inbox-top">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                      type="checkbox"
                      className="a-li-check"
                      checked={selected.has(m.id)}
                      onChange={() => toggle(m.id)}
                      aria-label={`Select message from ${m.name}`}
                    />
                    <span className="from">{!m.read && <span className="dot" />}{m.name}</span>{" "}
                    <span className="email">&lt;{m.email}&gt;</span>
                  </div>
                  <div className="email">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                  </div>
                </div>
                {m.subject ? <div className="subj">{m.subject}</div> : null}
                <div className="body">{m.message}</div>
                <div className="actions">
                  <a className="a-btn ghost sm" href={`mailto:${m.email}`}>Reply</a>
                  <button className="a-btn ghost sm" onClick={() => toggleRead(m)}>
                    Mark {m.read ? "unread" : "read"}
                  </button>
                  <button className="a-btn danger sm" onClick={() => remove(m)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
