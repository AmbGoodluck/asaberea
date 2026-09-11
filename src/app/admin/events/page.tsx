"use client";

import EntityManager, { type Field } from "@/components/admin/EntityManager";

const fields: Field[] = [
  { key: "title", label: "Event name", type: "text", placeholder: "Taste of Africa Night" },
  { key: "description", label: "Description", type: "textarea", placeholder: "What is this event about?" },
  { key: "imageUrl", label: "Flyer / image", type: "image", folder: "events" },
  { key: "date", label: "Date", type: "text", placeholder: "SEP 14 or 2026-09-14" },
  { key: "time", label: "Time", type: "text", placeholder: "6:00 PM" },
  { key: "venue", label: "Venue", type: "text", placeholder: "Woods-Penn" },
  { key: "link", label: "RSVP or details link (optional)", type: "url", placeholder: "berea.campusgroups.com/event/..." },
  { key: "slug", label: "Page web address (optional)", type: "text", placeholder: "leave blank to set automatically, e.g. mixer2026" },
  { key: "category", label: "Category", type: "select", options: ["Cultural", "Social", "Meeting", "Panel"] },
  { key: "isPast", label: "This is a past event (show under Past)", type: "toggle" },
];

export default function EventsAdmin() {
  return (
    <EntityManager
      resource="events"
      title="Events"
      subtitle="Upcoming events appear on Home and Events. Toggle past events to move them to the archive automatically."
      fields={fields}
      primaryKey="title"
    />
  );
}
