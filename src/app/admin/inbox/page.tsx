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

export default function InboxAdmin() {
  const { authedFetch } = useAdmin();
  const [items, setItems] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

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
    setItems((s) => s.filter((x) => x.id !== m.id));
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
        <div className="inbox-list">
          {items.map((m) => (
            <div key={m.id} className={"inbox-item" + (m.read ? "" : " unread")}>
              <div className="inbox-top">
                <div>
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
      )}
    </div>
  );
}
