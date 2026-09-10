"use client";

import EntityManager, { type Field } from "@/components/admin/EntityManager";

const fields: Field[] = [
  { key: "name", label: "Student name", type: "text", placeholder: "Aminata K." },
  { key: "headline", label: "Accomplishment / talent", type: "text", placeholder: "Published undergraduate researcher" },
  { key: "description", label: "Short description", type: "textarea", placeholder: "A sentence or two about them." },
  { key: "imageUrl", label: "Photo", type: "image", folder: "spotlights" },
  { key: "order", label: "Order (lower shows first)", type: "number" },
];

export default function SpotlightAdmin() {
  return (
    <EntityManager
      resource="spotlights"
      title="Spotlight"
      subtitle="Feature students and their accomplishments. These appear in the Spotlight section on the homepage."
      fields={fields}
      primaryKey="name"
    />
  );
}
