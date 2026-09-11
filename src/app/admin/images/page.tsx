"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import FocalImageUpload from "@/components/admin/FocalImageUpload";
import GalleryBulkUpload from "@/components/admin/GalleryBulkUpload";
import EntityManager, { type Field } from "@/components/admin/EntityManager";
import { IMAGE_SLOTS } from "@/lib/firebase/schema";

const DEFAULT_FOCAL = "50% 50%";

const galleryFields: Field[] = [
  { key: "imageUrl", label: "Photo", type: "image", folder: "gallery" },
  { key: "caption", label: "Caption", type: "text", placeholder: "Taste of Africa Night" },
  { key: "order", label: "Order", type: "number" },
];

type Slot = { url: string; position: string };

export default function ImagesAdmin() {
  const { authedFetch } = useAdmin();
  const [slots, setSlots] = useState<Record<string, Slot>>({});
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);
  const [galleryKey, setGalleryKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await authedFetch("/api/admin/images");
        if (res.ok) {
          const data = await res.json();
          setSlots(data.items || {});
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [authedFetch]);

  async function saveSlot(slot: string, next: Slot) {
    setSlots((s) => ({ ...s, [slot]: next }));
    setSavingSlot(slot);
    try {
      await authedFetch("/api/admin/images", {
        method: "PUT",
        body: JSON.stringify({ slot, url: next.url, position: next.position }),
      });
    } finally {
      setSavingSlot(null);
    }
  }

  return (
    <div>
      <div className="a-head">
        <div>
          <h1>Images</h1>
          <p>Swap the images used across the site, and manage the photo gallery, without touching code.</p>
        </div>
      </div>

      <div className="a-card" style={{ marginBottom: 26 }}>
        <h3>Page images</h3>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "-10px 0 18px", lineHeight: 1.55 }}>
          Upload a photo for each spot below, then click anywhere on it to choose what stays in
          view when it&apos;s cropped to fit the page (a face, a sign, whatever matters most).
        </p>
        {loading ? (
          <div className="a-empty">Loading...</div>
        ) : (
          <div className="slots-grid">
            {IMAGE_SLOTS.map((slot) => (
              <div key={slot.id}>
                <FocalImageUpload
                  label={slot.label + (savingSlot === slot.id ? " (saving...)" : "")}
                  value={slots[slot.id]?.url || ""}
                  position={slots[slot.id]?.position || DEFAULT_FOCAL}
                  folder={"slots/" + slot.id}
                  onChange={(next) => saveSlot(slot.id, next)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <GalleryBulkUpload onDone={() => setGalleryKey((k) => k + 1)} />

      <EntityManager
        key={galleryKey}
        resource="gallery"
        title="Gallery photos"
        subtitle="These appear in the gallery and the 'Always something happening' strip on the homepage. Use the box above to add many at once, or add one here with a custom caption."
        fields={galleryFields}
        primaryKey="caption"
      />
    </div>
  );
}
