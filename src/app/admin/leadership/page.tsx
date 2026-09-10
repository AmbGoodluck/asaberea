"use client";

import EntityManager, { type Field } from "@/components/admin/EntityManager";

const fields: Field[] = [
  { key: "name", label: "Name", type: "text", placeholder: "Full name" },
  { key: "position", label: "Position", type: "text", placeholder: "President" },
  { key: "major", label: "Major", type: "text", placeholder: "Computer Science" },
  { key: "description", label: "Short description", type: "textarea", placeholder: "A sentence about their role." },
  { key: "imageUrl", label: "Photo", type: "image", folder: "leadership" },
  { key: "order", label: "Order (lower shows first)", type: "number" },
];

export default function LeadershipAdmin() {
  return (
    <EntityManager
      resource="leadership"
      title="Leadership"
      subtitle="Manage the Executive Committee roster shown on the Leadership page."
      fields={fields}
      primaryKey="name"
    />
  );
}
