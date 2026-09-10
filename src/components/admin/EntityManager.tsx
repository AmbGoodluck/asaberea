"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "./AdminProvider";
import ImageUpload from "./ImageUpload";

export type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "number" | "select" | "image" | "toggle";
  options?: string[];
  placeholder?: string;
  folder?: string;
};

type Item = Record<string, unknown> & { id: string };

export default function EntityManager({
  resource,
  title,
  subtitle,
  fields,
  primaryKey = "title",
}: {
  resource: string;
  title: string;
  subtitle?: string;
  fields: Field[];
  primaryKey?: string;
}) {
  const { authedFetch } = useAdmin();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function emptyForm(): Record<string, unknown> {
    const f: Record<string, unknown> = {};
    for (const field of fields) {
      f[field.key] = field.type === "toggle" ? false : field.type === "number" ? 0 : "";
      if (field.type === "select" && field.options?.length) f[field.key] = field.options[0];
    }
    return f;
  }

  async function load() {
    setLoading(true);
    try {
      const res = await authedFetch(`/api/admin/collection/${resource}`);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    setForm(emptyForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm());
    setMsg(null);
  }
  function startEdit(it: Item) {
    setEditing(it);
    const f: Record<string, unknown> = {};
    for (const field of fields) f[field.key] = it[field.key] ?? (field.type === "toggle" ? false : "");
    setForm(f);
    setMsg(null);
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const path = editing
        ? `/api/admin/collection/${resource}/${editing.id}`
        : `/api/admin/collection/${resource}`;
      const res = await authedFetch(path, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setMsg(e.error === "invalid" ? "Please check the fields and try again." : "Could not save.");
        return;
      }
      await load();
      startCreate();
      setMsg("Saved.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(it: Item) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    await authedFetch(`/api/admin/collection/${resource}/${it.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="a-head">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="a-grid">
        <div className="a-card a-form">
          <h3>{editing ? "Edit" : "Add new"}</h3>
          {fields.map((f) => (
            <div className="a-field" key={f.key}>
              {f.type === "image" ? (
                <ImageUpload
                  label={f.label}
                  value={String(form[f.key] ?? "")}
                  folder={f.folder || resource}
                  onChange={(url) => setForm((s) => ({ ...s, [f.key]: url }))}
                />
              ) : f.type === "toggle" ? (
                <label className="a-toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(form[f.key])}
                    onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.checked }))}
                  />
                  <span>{f.label}</span>
                </label>
              ) : (
                <>
                  <label>{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      rows={4}
                      placeholder={f.placeholder}
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    >
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      placeholder={f.placeholder}
                      value={String(form[f.key] ?? "")}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                        }))
                      }
                    />
                  )}
                </>
              )}
            </div>
          ))}
          <div className="a-form-actions">
            <button className="a-btn primary" onClick={save} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Add"}
            </button>
            {editing && (
              <button className="a-btn ghost" onClick={startCreate}>
                Cancel
              </button>
            )}
            {msg && <span className="a-msg">{msg}</span>}
          </div>
        </div>

        <div className="a-card a-list">
          <h3>{items.length} item{items.length === 1 ? "" : "s"}</h3>
          {loading ? (
            <div className="a-empty">Loading...</div>
          ) : items.length === 0 ? (
            <div className="a-empty">Nothing yet. Add your first item.</div>
          ) : (
            <ul>
              {items.map((it) => (
                <li key={it.id}>
                  <div className="a-li-main">
                    {String(it.imageUrl || "") ? (
                      <span className="a-thumb" style={{ backgroundImage: `url(${it.imageUrl})` }} />
                    ) : (
                      <span className="a-thumb ph" />
                    )}
                    <div>
                      <div className="a-li-title">{String(it[primaryKey] ?? "Untitled")}</div>
                      {"position" in it && <div className="a-li-sub">{String(it.position)}</div>}
                      {"isPast" in it && (
                        <div className="a-li-sub">{it.isPast ? "Past event" : "Upcoming"}</div>
                      )}
                    </div>
                  </div>
                  <div className="a-li-actions">
                    <button className="a-btn ghost sm" onClick={() => startEdit(it)}>
                      Edit
                    </button>
                    <button className="a-btn danger sm" onClick={() => remove(it)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
