"use client";

import Link from "next/link";

const cards = [
  { href: "/admin/events", title: "Events", desc: "Post upcoming and past events with flyers, dates, and links." },
  { href: "/admin/stats", title: "Stats", desc: "Edit the four homepage numbers: nations, events, leaders, dues." },
  { href: "/admin/spotlight", title: "Spotlight", desc: "Feature students and their accomplishments on the homepage." },
  { href: "/admin/leadership", title: "Leadership", desc: "Manage the Executive Committee roster." },
  { href: "/admin/images", title: "Images", desc: "Swap the hero and page images for the whole site." },
  { href: "/admin/inbox", title: "Inbox", desc: "Read messages sent through the contact form." },
];

export default function AdminOverview() {
  return (
    <div>
      <div className="a-head">
        <div>
          <h1>Welcome back</h1>
          <p>Everything on the website is managed from here. Pick a section to begin.</p>
        </div>
      </div>
      <div className="a-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="a-card" style={{ display: "block" }}>
            <h3 style={{ marginBottom: 8 }}>{c.title}</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: 14.5, margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
