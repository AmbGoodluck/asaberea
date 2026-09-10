"use client";

import { useState } from "react";

type State = "idle" | "sending" | "sent" | "error" | "rate";

export default function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });

  function set(k: keyof typeof form, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setState("error");
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 429) {
        setState("rate");
        return;
      }
      if (!res.ok) {
        setState("error");
        return;
      }
      setState("sent");
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="cform-done">
        <div className="cform-check">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <h3 className="ny">Message sent</h3>
        <p>Thank you for reaching out. The ASA team will get back to you soon.</p>
        <button className="btn ghost" onClick={() => setState("idle")}>Send another</button>
      </div>
    );
  }

  return (
    <form className="cform" onSubmit={submit}>
      <div className="cform-row">
        <div className="cfield">
          <label>Name</label>
          <input value={form.name} maxLength={120} onChange={(e) => set("name", e.target.value)} placeholder="Your name" required />
        </div>
        <div className="cfield">
          <label>Email</label>
          <input type="email" value={form.email} maxLength={200} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" required />
        </div>
      </div>
      <div className="cfield">
        <label>Subject</label>
        <input value={form.subject} maxLength={160} onChange={(e) => set("subject", e.target.value)} placeholder="What is this about?" />
      </div>
      <div className="cfield">
        <label>Message</label>
        <textarea rows={6} value={form.message} maxLength={4000} onChange={(e) => set("message", e.target.value)} placeholder="Write your message" required />
      </div>
      {/* honeypot, hidden from humans */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => set("website", e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        aria-hidden
      />
      <div className="cform-actions">
        <button className="btn solid" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending..." : "Send message"}
        </button>
        {state === "error" && <span className="cform-msg err">Please fill in your name, a valid email, and a message.</span>}
        {state === "rate" && <span className="cform-msg err">You have sent a few messages already. Please try again in a little while.</span>}
      </div>
    </form>
  );
}
